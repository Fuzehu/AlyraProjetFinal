const { ethers } = require("hardhat");

async function main() {
  const MockedDai = await ethers.getContractFactory("MockedDai");
  console.log("Deploying the MockedDai contract...");
  const mockedDai = await MockedDai.deploy();
  console.log("MockedDai contract deployed at address:", mockedDai.target);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  