const { ethers } = require("hardhat");

async function main() {
  // The deployed address of the DiscountToken contract
  const DiscountTokenContractAddress = "0x81f02c412fF527778b2534f1c889CdB69849f498";
  // The address to be set as admin of the DiscountToken contract, in our case the address of the Staking contract
  const _newAdminAddress = "0x809165D10534041E13F07D958DBF87298b6AD582";

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