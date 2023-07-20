const { ethers } = require("hardhat");

async function main() {
    const tokenizeAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // ERC1155 contract address
    const discountTokenAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"; // ERC20 contract address
    
    const StakingERC1155Id1 = await ethers.getContractFactory("StakingERC1155Id1");
    console.log("Deploying the StakingERC1155Id1 contract...");

    const stakingERC1155Id1 = await StakingERC1155Id1.deploy(tokenizeAddress, discountTokenAddress);

    console.log("StakingERC1155Id1 contract deployed at address:", stakingERC1155Id1.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });