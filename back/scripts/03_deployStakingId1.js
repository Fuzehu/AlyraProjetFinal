const { ethers } = require("hardhat");

async function main() {
  const erc1155ContractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Aadresse du contrat ERC1155
  const erc20ContractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"; // Adresse du contrat ERC20
  
  const StakingTokenId1 = await ethers.getContractFactory("StakingTokenId1");
  console.log("Deploying the StakingTokenId1 contract...");

  const stakingTokenId1 = await StakingTokenId1.deploy(erc1155ContractAddress, erc20ContractAddress);

  console.log("StakingTokenId1 contract deployed at address:", stakingTokenId1.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });