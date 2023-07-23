const { ethers } = require("hardhat");

async function main() {
    const tokenizeContractAddress = "0x49aD546631bd4718847d49A2379563117A928191"; 
    const daiContractAddress = "0xfA0e305E0f46AB04f00ae6b5f4560d61a2183E00"; 
    
    const FundRaiser = await ethers.getContractFactory("FundRaiser");
    console.log("Deploying the FundRaiser contract...");

    const fundraiser = await FundRaiser.deploy(daiContractAddress, tokenizeContractAddress);

    console.log("FundRaiser contract deployed at address:", fundraiser.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });