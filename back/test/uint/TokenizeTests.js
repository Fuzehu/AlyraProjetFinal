const { expect, assert } = require('chai');
const { ethers } = require('hardhat');

describe('Testing Tokenize.sol contract', function () {
    let tokenize;
    let owner;
    let user1;

    beforeEach(async function () {
        const Tokenize = await ethers.getContractFactory('Tokenize');
        [owner, user1] = await ethers.getSigners();

        tokenize = await Tokenize.deploy();
    });

    describe('Testing getGfvInfoForTokenId function', function () {
        it('Should return the correct GfvInfo if the token exists', async function () {
            const tokenId = 1;
            await tokenize.connect(owner).initGfvInfoForATokenId(tokenId, 100, "ipfs://example.com", "TokenName");

            const gfvInfo = await tokenize.getGfvInfoForTokenId(tokenId);

            assert.isTrue(gfvInfo.exists);
            expect(gfvInfo.tokenName).to.equal("TokenName");
            expect(gfvInfo.totalSupply).to.equal(0); 
            expect(gfvInfo.sharePrice).to.equal(100);
            expect(gfvInfo.tokenURI).to.equal("ipfs://example.com");
        });

        it('Should revert with "Token does not exist" if the token does not exist', async function () {
            const nonExistentTokenId = 2;

            await expect(tokenize.getGfvInfoForTokenId(nonExistentTokenId)).to.be.revertedWith("Token does not exist");
        });
    });


    describe('Testing authorizeContract and revokeContract functions', function () {
    
        let fundRaiser;

        beforeEach(async function () {
            let mockedDai;

            const MockedDai = await ethers.getContractFactory("MockedDai");
            const Tokenize = await ethers.getContractFactory('Tokenize');
            const FundRaiser = await ethers.getContractFactory('FundRaiser');
    
            mockedDai = await MockedDai.deploy()
            tokenize = await Tokenize.deploy();
            fundRaiser = await FundRaiser.deploy(mockedDai.target, tokenize.target);
        });
    
        describe('authorizeContract function', function () {
            it('Should authorize a contract', async function () {
                expect(await tokenize._mintTokenFunctionAuthorizedContracts(fundRaiser.target)).to.equal(false);
                await tokenize.connect(owner).authorizeContract(fundRaiser.target);
                expect(await tokenize._mintTokenFunctionAuthorizedContracts(fundRaiser.target)).to.equal(true);
            });
    
            it('Should revert if the contract is already authorized', async function () {
                await tokenize.connect(owner).authorizeContract(fundRaiser.target);
                await expect(tokenize.connect(owner).authorizeContract(fundRaiser.target)).to.be.revertedWith('Contract is already authorized');
            });
    
            it('Should revert if not called by the owner', async function () {
                await expect(tokenize.connect(user1).authorizeContract(fundRaiser.target)).to.be.revertedWith('Ownable: caller is not the owner');
            });

            it('Should emit an event when a contract is authorized', async function () {
                await expect(tokenize.connect(owner).authorizeContract(fundRaiser.target))
                .to.emit(tokenize, 'ContractAuthorized')
                .withArgs(fundRaiser.target);
            });
        });
    
        describe('revokeContract function', function () {
            it('Should revoke an authorized contract', async function () {
                await tokenize.connect(owner).authorizeContract(fundRaiser.target);
                expect(await tokenize._mintTokenFunctionAuthorizedContracts(fundRaiser.target)).to.equal(true);
    
                await tokenize.connect(owner).revokeContract(fundRaiser.target);
                expect(await tokenize._mintTokenFunctionAuthorizedContracts(fundRaiser.target)).to.equal(false);
            });
    
            it('Should revert if the contract is not authorized', async function () {
                await expect(tokenize.connect(owner).revokeContract(fundRaiser.target)).to.be.revertedWith('Contract is not authorized');
            });
    
            it('Should revert if not called by the owner', async function () {
                await expect(tokenize.connect(user1).revokeContract(fundRaiser.target)).to.be.revertedWith('Ownable: caller is not the owner');
            });

            it('Should emit an event when a contract is revoked', async function () {
                await tokenize.connect(owner).authorizeContract(fundRaiser.target);
                await expect(tokenize.connect(owner).revokeContract(fundRaiser.target))
                .to.emit(tokenize, 'ContractRevoked')
                .withArgs(fundRaiser.target);
            });
        });
    });


    describe('Testing the init function', function () {
        it('should mint GENESIS token for owner', async function () {
            await tokenize.connect(owner).init();

            const balance = await tokenize.balanceOf(
                owner.address,
                0
            );
            expect(balance).to.equal(1);
        });

        it('should correctly set the GENESIS token info', async function () {
            await tokenize.connect(owner).init();
            const tokenInfo = await tokenize._gfvTokens(0);
    
            expect(tokenInfo.exists).to.be.true;
            expect(tokenInfo.tokenName).to.equal("GENESIS");
            expect(tokenInfo.totalSupply).to.equal(1);
            expect(tokenInfo.sharePrice).to.equal(0);
            expect(tokenInfo.tokenURI).to.equal("");
        });

        it('should revert if init is not called by owner', async function () {
            await expect(tokenize.connect(user1).init()).to.be.revertedWith(
                'Ownable: caller is not the owner'
            );
        });

        it('should revert if init is called more than once', async function () {
            await tokenize.connect(owner).init();
            await expect(tokenize.connect(owner).init()).to.be.revertedWith(
                "Init has already been called"
            );
        });
    });


    describe('Testing the mintTokenEmergenct function', function () {
        beforeEach(async function () {
            await tokenize.connect(owner).initGfvInfoForATokenId(1, 100, "ipfs://mytoken.com/1", "My Token");
        });

        const tokenId = 1;
        const tokenAmount = 100;

        it('Should revert if not called by owner', async function () {
            await expect(tokenize.connect(user1).mintTokenEmergency(user1, 1, 1)).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('Should revert if trying to mint an unitialized token', async function () {
            const uninitializedTokenId = 2;
        
            await expect(tokenize.mintTokenEmergency(owner.address, uninitializedTokenId, tokenAmount))
                .to.be.revertedWith('Token does not exist');
        });

        it('Should mint tokens and update total supply', async function () {
            const initialTotalSupply = 0;
            const expectedTotalSupply = initialTotalSupply + tokenAmount;

            await tokenize.mintTokenEmergency(owner.address, tokenId, tokenAmount);
    
            const token = await tokenize._gfvTokens(tokenId);
            expect(token.totalSupply).to.equal(expectedTotalSupply);
        });

        it('Should emit TokenMinted event', async function () {
            await expect(tokenize.mintTokenEmergency(owner.address, tokenId, tokenAmount))
                .to.emit(tokenize, 'TokenMinted')
                .withArgs(owner.address, tokenId, tokenAmount);
        });

    });
    

    describe('Testing the initGfvInfoForATokenId function', function () {
        const tokenId = 1;
        const sharePrice = 100;
        const uri = "ipfs://example.com/token";
        const tokenName = "Test Token";
    
        it('should initialize token info', async function () {
            await tokenize.connect(owner).initGfvInfoForATokenId(tokenId, sharePrice, uri, tokenName);
    
            const tokenInfo = await tokenize._gfvTokens(tokenId);
            expect(tokenInfo.exists).to.be.true;
            expect(tokenInfo.sharePrice).to.equal(sharePrice);
            expect(tokenInfo.totalSupply).to.equal(0);
            expect(tokenInfo.tokenURI).to.equal(uri);
            expect(tokenInfo.tokenName).to.equal(tokenName);
        });
    
        it('should revert if not called by owner', async function () {
            await expect(tokenize.connect(user1).initGfvInfoForATokenId(tokenId, sharePrice, uri, tokenName)).to.be.revertedWith('Ownable: caller is not the owner');
        });
    
        it('should revert if token already initialized', async function () {
            await tokenize.connect(owner).initGfvInfoForATokenId(tokenId, sharePrice, uri, tokenName);
            await expect(tokenize.connect(owner).initGfvInfoForATokenId(tokenId, sharePrice, uri, tokenName)).to.be.revertedWith('Token already initialized');
        });

        it('should set the token URI correctly', async function () {
            await tokenize.connect(owner).initGfvInfoForATokenId(tokenId, sharePrice, uri, tokenName);
            const setUri = await tokenize.uri(tokenId);
            expect(setUri).to.equal(uri);
        });
    });
    

    describe('Testing updateSharePriceAndUri function', function () {
        beforeEach(async function () {
            await tokenize.connect(owner).initGfvInfoForATokenId(1, 100, "ipfs://mytoken.com/1", "My Token");
        });

        it('should update the share price and uri for a token', async function () {
            const newSharePrice = 200;
            const newUri = "ipfs://mytoken.com/updated1";

            await tokenize.connect(owner).updateSharePriceAndUri(1, newSharePrice, newUri);

            let tokenInfo = await tokenize._gfvTokens(1);
            expect(tokenInfo.sharePrice).to.equal(newSharePrice);
            expect(tokenInfo.tokenURI).to.equal(newUri);
        });

        it('should revert if token does not exist', async function () {
            await expect(tokenize.connect(owner).updateSharePriceAndUri(2, 200, "ipfs://mytoken.com/2")).to.be.revertedWith("Token does not exist");
        });

        it('should revert if not called by owner', async function () {
            await expect(tokenize.connect(user1).updateSharePriceAndUri(1, 200, "ipfs://mytoken.com/updated1")).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe('Testing updateTokenURI function', function () {
        beforeEach(async function () {
            await tokenize.connect(owner).initGfvInfoForATokenId(1, 100, "ipfs://mytoken.com/1", "My Token");
        });

        it('should update the uri for a token', async function () {
            const newUri = "ipfs://mytoken.com/new1";

            await tokenize.connect(owner).updateTokenURI(1, newUri);

            let tokenInfo = await tokenize._gfvTokens(1);
            expect(tokenInfo.tokenURI).to.equal(newUri);
        });

        it('should revert if token does not exist', async function () {
            await expect(tokenize.connect(owner).updateTokenURI(2, "ipfs://mytoken.com/new2")).to.be.revertedWith("Token does not exist");
        });

        it('should revert if not called by owner', async function () {
            await expect(tokenize.connect(user1).updateTokenURI(1, "ipfs://mytoken.com/new1")).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });









    describe('ERC1155 compatibility', function () {
        it('should allow token transfers', async function () {
            await tokenize.connect(owner).init();
            await tokenize.connect(owner).safeTransferFrom(
                owner.address,
                user1.address,
                0,
                1,
                "0x"
            );

            const balance = await tokenize.balanceOf(user1.address, 0);
            expect(balance).to.equal(1);
        });

        it('should allow batch token transfers', async function () {
            await tokenize.connect(owner).init();
            await tokenize
                .connect(owner)
                .safeBatchTransferFrom(
                    owner.address,
                    user1.address,
                    [0],
                    [1],
                    "0x"
                );

            const balance = await tokenize.balanceOf(user1.address, 0);
            expect(balance).to.equal(1);
        });
    });
});
