const { expect } = require("chai");
const { ethers } = require("hardhat");


describe('Testing FundRaiser.sol contract', function() {
    let owner;
    let addr1;
    let addr2;
    let addr3;

    let mockedDai;
    let tokenize;
    let fundRaiser;

    beforeEach(async function() {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
        const Tokenize = await ethers.getContractFactory("Tokenize");
        const MockedDai = await ethers.getContractFactory("MockedDai");
 
        [tokenize, mockedDai] = await Promise.all([
          Tokenize.deploy(),
          MockedDai.deploy()
        ]);

        // Initialize FundRaiser SC from MockedDai and Tokenize Addresses
        const FundRaiser = await ethers.getContractFactory("FundRaiser");
        fundRaiser = await FundRaiser.deploy(mockedDai.target, tokenize.target);
    
        // Intialize GFV Struct for different tokenId
        await tokenize.connect(owner).initGfvInfoForATokenId(1, 100, "https://mytoken.com/1", "My Token1");
        await tokenize.connect(owner).initGfvInfoForATokenId(2, 200, "https://mytoken.com/2", "My Token2");
        await tokenize.connect(owner).initGfvInfoForATokenId(3, 400, "https://mytoken.com/3", "My Token3");

        // Prefund wallets with mockedDai
        await mockedDai.connect(owner).mint(addr1.address, '90000000000000000000000000000'); 
        await mockedDai.connect(owner).mint(addr2.address, '90000000000000000000000000000'); 
        await mockedDai.connect(owner).mint(addr3.address, '90000000000000000000000000000'); 

        // Give the authorization to FundRaiser contract to call the mintToken function
        await tokenize.connect(owner).authorizeContract(fundRaiser.target);
    });

    describe("Testing Deployment informations", function() {
        it("Should set the right owner", async function() {
            expect(await fundRaiser.owner()).to.equal(owner.address);
        });

        it("Should set the right acceptedToken", async function() {
            expect(await fundRaiser.acceptedToken()).to.equal(mockedDai.target);
        });

        it("Should set the right tokenize contract", async function() {
            expect(await fundRaiser.tokenize()).to.equal(tokenize.target);
        });

        it("Should initialize the contract in the right state", async function() {
            expect(await fundRaiser.currentStatus()).to.equal(0); // As Listing status is first in enum so its value will be 0
        });

        it("Should set the initial ticket count to zero", async function() {
            expect(await fundRaiser.ticketsSold()).to.equal(0);
        });
    });


    describe('Testing addToWhitelist function', function() {
        it("Owner should be able to add address to whitelist", async function() {
            await fundRaiser.connect(owner).addToWhitelist(addr1.address);
            expect(await fundRaiser.whitelist(addr1.address)).to.equal(true);
        });

        it("Should revert if not called by the Owner", async function() {
            await expect(fundRaiser.connect(addr1).addToWhitelist(addr1.address)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should revert the address is already whitelisted", async function() {
            await fundRaiser.connect(owner).addToWhitelist(addr1.address);
            await expect(fundRaiser.connect(owner).addToWhitelist(addr1.address)).to.be.revertedWith("The address is already whitelisted");
        });

        it("Should emit AddedToWhitelist event", async function() {
            await expect(fundRaiser.connect(owner).addToWhitelist(addr1.address))
            .to.emit(fundRaiser, 'AddedToWhitelist')
            .withArgs(addr1.address);
        });
    });


    describe('Testing removeFromWhitelist function', function() {
        it("Owner should be able to remove address from whitelist", async function() {
            await fundRaiser.connect(owner).addToWhitelist(addr1.address);
            await fundRaiser.connect(owner).removeFromWhitelist(addr1.address);
            expect(await fundRaiser.whitelist(addr1.address)).to.equal(false);
        });

        it("Should revert if not called by the Owner", async function() {
            await fundRaiser.connect(owner).addToWhitelist(addr1.address);
            await expect(fundRaiser.connect(addr1).removeFromWhitelist(addr1.address)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should revert if trying to remove an address not whitelisted", async function() {
            await expect(fundRaiser.connect(owner).removeFromWhitelist(addr1.address)).to.be.revertedWith("The address is not currently whitelisted");
        });

        it("Should emit RemovedFromWhitelist event", async function() {
            await fundRaiser.connect(owner).addToWhitelist(addr1.address);
            await expect(fundRaiser.connect(owner).removeFromWhitelist(addr1.address))
                .to.emit(fundRaiser, 'RemovedFromWhitelist')
                .withArgs(addr1.address);
        });
    });


    describe('Testing startFundraising function', function() {
        it('Should revert if not called by the owner', async function() {
            expect(fundRaiser.connect(addr1).startFundraising()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    
        it('Should revert if current status is not Listing', async function() {
            await fundRaiser.connect(owner).startFundraising();  // first time should pass
            expect(fundRaiser.startFundraising()).to.be.revertedWith("Cannot start fundraising from current status"); // second time should fail
        });
    
        it('Should be able to start fundraising if current status is Listing', async function() {
            await expect(fundRaiser.connect(owner).startFundraising())
                .to.emit(fundRaiser, 'StatusChanged')
                .withArgs(1); // Fundraising status should be 1 after startFundraising
            expect(fundRaiser.currentStatus()).to.eventually.equal(1);
        });
    });


    describe('Testing endFundraiser function', function() {
        beforeEach(async function() {
            await fundRaiser.connect(owner).startFundraising(); 
        });

        it('Should not be able to end the fundraiser if ticketsSold is less than MAX_TICKETS', async function() {
            await fundRaiser.addToWhitelist(addr1.address);
            await mockedDai.connect(addr1).approve(fundRaiser.target, '500000000000000000000');
            await fundRaiser.connect(addr1).buyTicket(1);
    
            expect(fundRaiser.connect(owner).endFundraiser()).to.be.revertedWith("Fundraising not finished");
        });
    
        it('Should revert if not called by owner', async function() {
            expect(fundRaiser.connect(addr1).endFundraiser()).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it('Should be able to end the fundraiser if ticketsSold is equal to MAX_TICKETS', async function() {
            await fundRaiser.addToWhitelist(addr1.address);
            await mockedDai.connect(addr1).approve(fundRaiser.target, '100000000000000000000000');
            await fundRaiser.connect(addr1).buyTicket(200);
    
            await fundRaiser.connect(owner).endFundraiser();
            expect(fundRaiser.currentStatus()).to.eventually.equal(2);
        });
    
        it('Should transfer the funds to the owner when the fundraiser ends', async function() {
            await fundRaiser.addToWhitelist(addr1.address);
            await mockedDai.connect(addr1).approve(fundRaiser.target, '100000000000000000000000');
            await fundRaiser.connect(addr1).buyTicket(200);
    
            const ownerBalanceBefore = await mockedDai.balanceOf(owner.address);
            await fundRaiser.connect(owner).endFundraiser();
            const ownerBalanceAfter = await mockedDai.balanceOf(owner.address);
    
            expect(BigInt(ownerBalanceAfter)).to.equal(BigInt(ownerBalanceBefore) + BigInt('100000000000000000000000'));
        });
    });


    describe('Testing startMinting function', function() {
        beforeEach(async function() {
            await fundRaiser.connect(owner).startFundraising(); 
        });
        
        it('Should not be able to start minting if the fundraiser has not ended', async function() {
            await fundRaiser.addToWhitelist(addr1.address);
            await mockedDai.connect(addr1).approve(fundRaiser.target, '500000000000000000000');
            await fundRaiser.connect(addr1).buyTicket(1);
    
            await expect(fundRaiser.connect(owner).startMinting()).to.be.revertedWith("Fundraising not finished yet");
        });
    
        it('Should revert if not called by owner', async function() {
            expect(fundRaiser.connect(addr1).startMinting()).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it('Should revert if current status is not FundraisingComplete', async function() {
            await expect(fundRaiser.connect(owner).startMinting()).to.be.revertedWith("Fundraising not finished yet");
        });

        it('Should be able to start minting if the fundraiser has ended', async function() {
            await fundRaiser.addToWhitelist(addr1.address);
            await mockedDai.connect(addr1).approve(fundRaiser.target, '100000000000000000000000');
            await fundRaiser.connect(addr1).buyTicket(200);
            await fundRaiser.connect(owner).endFundraiser();

            expect(BigInt((await fundRaiser.currentStatus()).toString())).to.equal(BigInt(2)); 

            await fundRaiser.connect(owner).startMinting();
            expect(BigInt((await fundRaiser.currentStatus()).toString())).to.equal(BigInt(3)); 
        });
    });

    describe('Testing buyTicket function', function() {
        beforeEach(async function() {
            await fundRaiser.addToWhitelist(addr1.address);
            await fundRaiser.addToWhitelist(addr2.address);
            await mockedDai.connect(addr1).approve(fundRaiser.target, '50000000000000000000000');
            await mockedDai.connect(addr2).approve(fundRaiser.target, '50000000000000000000000'); 
            await fundRaiser.connect(owner).startFundraising(); 
        });
    
        it('Should not be able to buy tickets if address is not whitelisted', async function() {
            await fundRaiser.removeFromWhitelist(addr1.address);
            await expect(fundRaiser.connect(addr1).buyTicket(1)).to.be.revertedWith("Your address is not whitelisted");
        });
    
        it('Should be able to buy tickets if address is whitelisted and fundraising is active', async function() {
            await expect(fundRaiser.connect(addr1).buyTicket(1)).to.not.be.reverted;
        });
    
        it('Should not be able to buy tickets if fundraising has ended', async function() {
            await fundRaiser.connect(addr1).buyTicket(100);
            await fundRaiser.connect(addr2).buyTicket(100);
    
            await fundRaiser.connect(owner).endFundraiser();
    
            await expect(fundRaiser.connect(addr1).buyTicket(1)).to.be.revertedWith("Fundraising ended");
        });
    
        it('Should revert if trying to buy more tickets than available', async function() {
            await fundRaiser.connect(addr1).buyTicket(100);
            await expect(fundRaiser.connect(addr2).buyTicket(101)).to.be.revertedWith("There are not enough tickets available");
        });
    
        it('Should update ticketsSold and ticketOwners correctly', async function() {
            await fundRaiser.connect(addr1).buyTicket(100);
            await fundRaiser.connect(addr2).buyTicket(100);
    
            expect(await fundRaiser.ticketsSold()).to.equal(200);
            expect(await fundRaiser.ticketOwners(addr1.address)).to.equal(100);
            expect(await fundRaiser.ticketOwners(addr2.address)).to.equal(100);
        });
    
        it('Should update contract balance correctly after buying tickets', async function() {
            await fundRaiser.connect(addr1).buyTicket(100);
        
            expect(await mockedDai.balanceOf(fundRaiser.target)).to.equal('50000000000000000000000');
        });
    
        it('Should update ticketOwners and ticketsSold after buying tickets', async function() {
            await fundRaiser.connect(addr1).buyTicket(50);
        
            let ticketOwnersValue = await fundRaiser.ticketOwners(addr1.address);
            let ticketsSoldValue = await fundRaiser.ticketsSold();
        
            expect(ticketOwnersValue).to.equal(50);
            expect(ticketsSoldValue).to.equal(50);
        });
    });

    describe('Testing claimTokens function', function() {
        beforeEach(async function() {
            await fundRaiser.addToWhitelist(addr1.address);
            await fundRaiser.addToWhitelist(addr2.address);
            await mockedDai.connect(addr1).approve(fundRaiser.target, '50000000000000000000000'); 
            await mockedDai.connect(addr2).approve(fundRaiser.target, '50000000000000000000000'); 
            await fundRaiser.connect(owner).startFundraising(); 
            await fundRaiser.connect(addr1).buyTicket(100);
            await fundRaiser.connect(addr2).buyTicket(100);
            await fundRaiser.connect(owner).endFundraiser();
            await fundRaiser.connect(owner).startMinting();
        });
    
        it('Should allow a whitelisted address to claim tokens', async function() {
            await expect(fundRaiser.connect(addr1).claimTokens()).to.not.be.reverted;
            await expect(fundRaiser.connect(addr2).claimTokens()).to.not.be.reverted;
        });
    
        it('Should not allow a non-whitelisted address to claim tokens', async function() {
            await fundRaiser.removeFromWhitelist(addr1.address);
            await expect(fundRaiser.connect(addr1).claimTokens()).to.be.revertedWith("Your address is not whitelisted");
        });
    
        it('Should reduce ticketOwners balance correctly', async function() {
            await fundRaiser.connect(addr1).claimTokens();
            await fundRaiser.connect(addr2).claimTokens();
            expect(await fundRaiser.ticketOwners(addr1.address)).to.equal(0);
            expect(await fundRaiser.ticketOwners(addr2.address)).to.equal(0);
        });
    
        it('Should increase token balance correctly', async function() {
          await fundRaiser.connect(addr1).claimTokens();
          await fundRaiser.connect(addr2).claimTokens();
          expect(await tokenize.balanceOf(addr1.address, 1)).to.equal(100);
          expect(await tokenize.balanceOf(addr2.address, 1)).to.equal(100);
        });
    });

    describe('Testing requestRefund function', function() {
        beforeEach(async function() {
            await fundRaiser.addToWhitelist(addr1.address);
            await fundRaiser.addToWhitelist(addr2.address);
            await fundRaiser.addToWhitelist(addr3.address);
            await mockedDai.connect(addr1).approve(fundRaiser.target, '50000000000000000000000'); 
            await mockedDai.connect(addr2).approve(fundRaiser.target, '25000000000000000000000'); 
            await fundRaiser.connect(owner).startFundraising(); 
            await fundRaiser.connect(addr1).buyTicket(100);
            await fundRaiser.connect(addr2).buyTicket(50);
        });

        it('Should allow a whitelisted address to request a refund', async function() {
            const initialBalance = await mockedDai.balanceOf(addr1.address);
            await fundRaiser.connect(addr1).requestRefund();
            const finalBalance = await mockedDai.balanceOf(addr1.address);
            expect(finalBalance-initialBalance).to.equal('50000000000000000000000'); 
        });

        it('Should revert if a non-whitelisted address tries to request a refund', async function() {
            await fundRaiser.removeFromWhitelist(addr1);
            await expect(fundRaiser.connect(addr1).requestRefund()).to.be.revertedWith("Your address is not whitelisted");
        });

        it('Should reduce ticketOwners balance correctly', async function() {
            await fundRaiser.connect(addr1).requestRefund();
            expect(await fundRaiser.ticketOwners(addr1)).to.equal(0);
        });

        it('Should reduce the ticketsSold count correctly', async function() {
            await fundRaiser.connect(addr1).requestRefund();
            expect(await fundRaiser.ticketsSold()).to.equal(50); // Started with 150 tickets sold, refunded 100
        });

        it('Should revert if an address without tickets tries to request a refund', async function() {
            await expect(fundRaiser.connect(addr3).requestRefund()).to.be.revertedWith("You do not have any tickets");
        });

        it('Should revert if a refund is requested after all tickets have been sold', async function() {
            await mockedDai.connect(addr3).approve(fundRaiser.target, '50000000000000000000000'); 
            await fundRaiser.connect(addr3).buyTicket(50);
            await expect(fundRaiser.connect(addr3).requestRefund()).to.be.revertedWith("All tickets have been sold");
        });
    });


    describe('Testing fallback and receive', function() {
        it("Should revert when trying to send Ether to the contract", async function() {
            await expect(
                addr1.sendTransaction({
                    to: fundRaiser.target,
                    value: "1000000000000000000" 
                })
            ).to.be.revertedWith("This contract does not accept ether"); 
        });
    });
});