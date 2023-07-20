const { ethers } = require("hardhat");

async function main() {
  const DiscountToken = await ethers.getContractFactory("DiscountToken");
  console.log("Deploying the DiscountToken contract...");
  const discountToken = await DiscountToken.deploy();
  console.log("DiscountToken contract deployed at address:", discountToken.target);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  