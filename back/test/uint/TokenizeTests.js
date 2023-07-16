const { expect, assert } = require('chai');
const { ethers } = require('hardhat');

describe('Tokenize', function () {
    let tokenize;
    let owner;
    let user1;

    beforeEach(async function () {
        const Tokenize = await ethers.getContractFactory('Tokenize');
        [owner, user1] = await ethers.getSigners();

        tokenize = await Tokenize.deploy();
    });


    describe('init function', function () {
        it('should mint GENESIS token for owner', async function () {
            await tokenize.connect(owner).init();

            const balance = await tokenize.balanceOf(
                '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                0
            );
            expect(balance).to.equal(1);
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


    describe('mintToken function', function () {
        const totalSupply = 100;
        const tokenName = 'TOKEN';
        const tokenURI = 'ipfs://tokenHashMetadata';

        it('should mint a new token for a specified address and update GFV struct informations', async function () {
            await tokenize.connect(owner).init(); // tokenID 0
            await tokenize.connect(owner).mintToken( // tokenID 1
                user1.address,
                totalSupply,
                tokenName,
                tokenURI
            );

            const balance = await tokenize.balanceOf(user1.address, 1);
            expect(balance).to.equal(totalSupply);

            const gfvToken = await tokenize._gfvTokens(1);

            expect(gfvToken.tokenName).to.equal(tokenName);
            expect(gfvToken.tokenId).to.equal(1)
            expect(gfvToken.totalSupply).to.equal(totalSupply); 
            expect(gfvToken.tokenURI).to.equal(tokenURI);
        });

        it('should revert if mintToken is not called by owner', async function () {
            await expect(
                tokenize
                    .connect(user1)
                    .mintToken(user1.address, totalSupply, tokenName, tokenURI)
            ).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('should emit a TokenMinted event', async function () {
            await expect(
                tokenize.connect(owner).mintToken(
                    user1.address,
                    totalSupply,
                    tokenName,
                    tokenURI
                )
            )
                .to.emit(tokenize, 'TokenMinted')
                .withArgs(1, tokenName, totalSupply, tokenURI);
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
