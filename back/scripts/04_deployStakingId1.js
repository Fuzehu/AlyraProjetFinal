const { ethers } = require("hardhat");

async function main() {
    const tokenizeAddress = "0x49aD546631bd4718847d49A2379563117A928191"; // ERC1155 contract address
    const discountTokenAddress = "0x81f02c412fF527778b2534f1c889CdB69849f498"; // ERC20 contract address
    
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