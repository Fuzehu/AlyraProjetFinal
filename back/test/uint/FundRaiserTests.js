const { expect } = require("chai");
const { ethers } = require("hardhat");


describe('Testing FundRaiser.sol contract', function() {
    let owner;
    let addr1;
    let addr2;

    let mockedDai;
    let tokenize;
    let fundRaiser;

    beforeEach(async function() {
        [owner, addr1, addr2] = await ethers.getSigners();
    
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
            expect(await fundRaiser.currentStatus()).to.equal(0); // As Fundraising status is first in enum so its value will be 0
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
    
        it("Should revert thhe address is already whitelisted", async function() {
            await fundRaiser.connect(owner).addToWhitelist(addr1.address);
            await expect(fundRaiser.connect(owner).addToWhitelist(addr1.address)).to.be.revertedWith("The address is already whitelisted");
        });
    
        it("Owner should be able to remove address from whitelist", async function() {
            await fundRaiser.connect(owner).addToWhitelist(addr1.address);
            await fundRaiser.connect(owner).removeFromWhitelist(addr1.address);
            expect(await fundRaiser.whitelist(addr1.address)).to.equal(false);
        });
    
        it("Should revert if removeFromWhitelist is not called by the Owner", async function() {
            await fundRaiser.connect(owner).addToWhitelist(addr1.address);
            await expect(fundRaiser.connect(addr1).removeFromWhitelist(addr1.address)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    
        it("Owner should not be able to remove an address not in whitelist", async function() {
            await expect(fundRaiser.connect(owner).removeFromWhitelist(addr1.address)).to.be.revertedWith("The address is not currently whitelisted");
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
    });



});