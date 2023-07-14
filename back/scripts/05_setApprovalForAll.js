const { ethers } = require("hardhat");

async function main() {
  // Adresse du contrat DiscountToken déployé
  const TokenizeContractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  // Adresse à laquelle on souhaiter donner les droits, dans notre cas le SC de Staking qui doit pouvoir gérer les NFT reçu
  const addresToAuthorize = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0"; 

  // Récupération de la Factory (artifacts) du contrat Tokenize 
  const Tokenize = await ethers.getContractFactory("Tokenize");
  // On se connecte au contrat Tokenize via son addresse 
  const tokenizeContract = await Tokenize.attach(TokenizeContractAddress);

  // On set addresToAuthorize afin qu'elle bénéficie des droits souhaités
  await tokenizeContract.setApprovalForAll(addresToAuthorize, true);
  console.log("Authorizing spender address on _setApprovalForAll function...");

  // On vérifie si l'addresToAuthorize bénéficie bien des droits
  const isApproved = await tokenizeContract.isApprovedForAll(ownerAddress, addresToAuthorize);
  console.log("Is spender address approved for owner address:", isApproved);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });