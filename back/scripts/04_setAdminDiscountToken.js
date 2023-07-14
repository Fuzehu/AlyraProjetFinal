const { ethers } = require("hardhat");

async function main() {
  // Adresse du contrat DiscountToken déployé
  const DiscountTokenContractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"; 
  // Adresse à définir comme administrateur du contrat DiscountToken, dans notre cas l'addresse du contract de Staking
  const _newAdminAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; 

  // Récupération de la Factory (artifacts) du contrat DiscountToken 
  const DiscountToken = await ethers.getContractFactory("DiscountToken");
  // On se connecte au contrat DiscountToken via son addresse 
  const discountToken = await DiscountToken.attach(DiscountTokenContractAddress); 

  // On définit l'addresse souhaitée comme admin via la fonction addAdminRights
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