const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xD164D22d8290D47ae2a84950992D0A5fD6D05e7e";
  const relayerAddress = "0x8a547Feb8B9AC2a7F137a0aBab94da6051aFAdF6";
  
  console.log("Adding minter role to relayer...");
  console.log("Contract:", contractAddress);
  console.log("Relayer:", relayerAddress);
  
  // Get contract instance
  const FlexCardNFT = await ethers.getContractFactory("FlexCardNFT");
  const flexCard = FlexCardNFT.attach(contractAddress);
  
  // Add minter role
  const tx = await flexCard.addMinter(relayerAddress);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for confirmation
  await tx.wait();
  console.log("Minter role granted successfully!");
  
  // Verify
  const MINTER_ROLE = await flexCard.MINTER_ROLE();
  const hasMinterRole = await flexCard.hasRole(MINTER_ROLE, relayerAddress);
  console.log("Relayer has minter role:", hasMinterRole);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });