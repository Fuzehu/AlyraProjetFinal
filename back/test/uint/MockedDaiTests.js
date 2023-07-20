const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Testing MockedDai.sol contract", function() {
  let mockedDai;
  let owner;
  let addr1;

    beforeEach(async function() {
        const MockedDai = await ethers.getContractFactory("MockedDai");
        [owner, addr1] = await ethers.getSigners();
        
        mockedDai = await MockedDai.deploy();
    });

    it("Should correctly set token metadata", async function() {
        expect(await mockedDai.name()).to.equal("MockedDai");
        expect(await mockedDai.symbol()).to.equal("DAI");
    });

    it("Should mint new tokens", async function() {
        await mockedDai.mint(addr1.address, 100);
        expect(await mockedDai.balanceOf(addr1.address)).to.equal(100);
    });

    it("Should revert if not called by Owner", async function() {
      const mockedDaiFromAddr1 = mockedDai.connect(addr1);
      await expect(mockedDaiFromAddr1.mint(addr1.address, 100)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
  });
});
