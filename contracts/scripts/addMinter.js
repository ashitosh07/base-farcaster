const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc";
  const relayerAddress = ethers.getAddress("0x8a547Feb8B9AC2a7F137a0aBab94da6051aFAdF6");
  
  console.log("Adding minter role...");
  console.log("Contract:", contractAddress);
  console.log("Relayer:", relayerAddress);
  
  const FlexCard = await ethers.getContractAt("FlexCard", contractAddress);
  
  // Check if already has minter role
  const hasMinterRole = await FlexCard.minters(relayerAddress);
  if (hasMinterRole) {
    console.log("✅ Relayer already has minter role");
    return;
  }
  
  // Add minter role
  const tx = await FlexCard.addMinter(relayerAddress);
  console.log("Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ Minter role granted successfully");
  
  // Verify
  const hasRole = await FlexCard.minters(relayerAddress);
  console.log("Verification - Has minter role:", hasRole);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });