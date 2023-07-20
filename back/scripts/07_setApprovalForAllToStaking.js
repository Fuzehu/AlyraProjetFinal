const { ethers } = require("hardhat");

async function main() {
  // The deployed address of the DiscountToken contract
  const TokenizeContractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  // The address that we want to give rights to, in our case the Staking SC which needs to be able to manage received NFTs
  const addresToAuthorize = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; 

  // Owner address on local blockchain hardhat
  const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 

  // Retrieving the Factory (artifacts) of the Tokenize contract
  const Tokenize = await ethers.getContractFactory("Tokenize");
  // We connect to the Tokenize contract via its address
  const tokenizeContract = await Tokenize.attach(TokenizeContractAddress);

  // We set addresToAuthorize so that it benefits from the desired rights
  await tokenizeContract.setApprovalForAll(addresToAuthorize, true);
  console.log("Authorizing addresToAuthorize address on _setApprovalForAll function...");

  // We check if addresToAuthorize indeed benefits from the rights
  const isApproved = await tokenizeContract.isApprovedForAll(ownerAddress, addresToAuthorize);
  console.log("Is addresToAuthorize address approved for owner address:", isApproved);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });