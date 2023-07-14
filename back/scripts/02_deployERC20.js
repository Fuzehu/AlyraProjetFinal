const { ethers } = require("hardhat");

async function main() {
  const DiscountToken = await ethers.getContractFactory("DiscountToken");
  console.log("Deploying the DiscountToken contract...");
  const discountToken = await DiscountToken.deploy();
  await discountToken.deployed();
  console.log("DiscountToken contract deployed at address:", discountToken.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  