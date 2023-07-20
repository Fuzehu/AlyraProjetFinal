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






});