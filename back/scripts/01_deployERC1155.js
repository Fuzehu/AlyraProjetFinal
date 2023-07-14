const { ethers } = require("hardhat");

async function main() {
  const Tokenize = await ethers.getContractFactory("Tokenize");
  console.log("Deploying the Tokenize contract...");
  const tokenize = await Tokenize.deploy();
  await tokenize.deployed();
  console.log("Tokenize contract deployed at address:", tokenize.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
