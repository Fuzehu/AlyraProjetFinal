const { ethers } = require("hardhat");

async function main() {
  // The deployed address of the DiscountToken contract
  const TokenizeContractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  // The address that we want to give rights to, in our case the FundRaiser SC which needs to be able to manage received NFTs
  const addresToAuthorize = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; 

  // Retrieving the Factory (artifacts) of the Tokenize contract
  const Tokenize = await ethers.getContractFactory("Tokenize");
  // We connect to the Tokenize contract via its address
  const tokenizeContract = await Tokenize.attach(TokenizeContractAddress);

  // We set the address to authorize so that it benefits from the desired rights
  await tokenizeContract.authorizeContract(addresToAuthorize);
  console.log("Authorizing spender address on _setApprovalForAll function...");

  // We check if the address to authorize indeed benefits from the given rights attributed 
  const isAuthorized = await tokenizeContract._mintTokenFunctionAuthorizedContracts(addresToAuthorize);
  console.log("Is the address authorized to mint tokens:", isAuthorized);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });