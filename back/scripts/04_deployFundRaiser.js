const { ethers } = require("hardhat");

async function main() {
    const tokenizeContractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 
    const daiContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; 
    
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