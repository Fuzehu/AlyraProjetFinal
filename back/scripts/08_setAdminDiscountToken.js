const { ethers } = require("hardhat");

async function main() {
  // The deployed address of the DiscountToken contract
  const DiscountTokenContractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
  // The address to be set as the admin of the DiscountToken contract, in our case the address of the Staking contract
  const _newAdminAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

  // Retrieving the Factory (artifacts) of the DiscountToken contract
  const DiscountToken = await ethers.getContractFactory("DiscountToken");
  // We connect to the DiscountToken contract via its address
  const discountToken = await DiscountToken.attach(DiscountTokenContractAddress);

  // We set the desired address as admin using the addAdminRights function
  await discountToken.addAdminRights(_newAdminAddress);
  console.log("Setting admin address in DiscountToken contract...");

  console.log("Admin address set in DiscountToken contract:", _newAdminAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });