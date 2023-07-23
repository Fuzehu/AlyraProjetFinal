const { ethers } = require("hardhat");

async function main() {
    // The deployed address of the MockedDai contract
    const MockedDaiContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    // Addresses to receive the tokens
    const recipientAddresses = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    ];

    // Amount to mint for each address
    const amount = "1000000000000000000000000";
    // Retrieving the Factory (artifacts) of the MockedDai contract
    const MockedDai = await ethers.getContractFactory("MockedDai");
    // We connect to the MockedDai contract via its address
    const mockedDai = await MockedDai.attach(MockedDaiContractAddress);

    for (let i = 0; i < recipientAddresses.length; i++) {
        await mockedDai.mint(recipientAddresses[i], amount);
        console.log(`Minted ${amount} tokens to ${recipientAddresses[i]}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
