const { ethers, network } = require("hardhat");

async function mineBlocks(numBlocks) {
  for (let i = 0; i < numBlocks; i++) {
    await network.provider.send("evm_mine");
  }
}

(async () => {
  // Utilisation : miner 100 blocs consécutifs
  await mineBlocks(100);
})();