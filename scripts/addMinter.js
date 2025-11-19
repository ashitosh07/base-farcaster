// Script to add minter role to relayer wallet
// Run: npx hardhat run scripts/addMinter.js --network baseSepolia

const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc";
  const relayerAddress = "0x742d35Cc6634C0532925a3b8D6Ac6E7D9C8b5c6f";
  
  console.log("Adding minter role...");
  console.log("Contract:", contractAddress);
  console.log("Relayer:", relayerAddress);
  
  const FlexCard = await ethers.getContractAt("FlexCard", contractAddress);
  
  // Add minter role
  const tx = await FlexCard.addMinter(relayerAddress);
  await tx.wait();
  
  console.log("✅ Minter role granted!");
  console.log("Transaction:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});