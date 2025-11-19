const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc";
  const relayerAddress = "0x8a547Feb8B9AC2a7F137a0aBab94da6051aFAdF6";
  
  console.log("=== Contract Debug Info ===");
  console.log("Contract:", contractAddress);
  console.log("Relayer:", relayerAddress);
  
  const FlexCard = await ethers.getContractAt("FlexCard", contractAddress);
  
  // Check owner
  const owner = await FlexCard.owner();
  console.log("Contract owner:", owner);
  console.log("Is relayer the owner?", owner.toLowerCase() === relayerAddress.toLowerCase());
  
  // Check minter role
  const hasMinterRole = await FlexCard.minters(relayerAddress);
  console.log("Has minter role:", hasMinterRole);
  
  // Try to call mintTo to see exact error
  console.log("\n=== Testing mintTo call ===");
  try {
    const testAddress = "0x742D35CC6634C0532925A3B8D6ac6e7D9C8B5C6f";
    const testURI = "ipfs://test";
    
    // This should fail with the exact error
    await FlexCard.mintTo.staticCall(testAddress, testURI);
    console.log("✅ mintTo call would succeed");
  } catch (error) {
    console.log("❌ mintTo call failed:", error.message);
    
    // Check if it's a revert with reason
    if (error.message.includes("Not authorized to mint")) {
      console.log("🔍 Authorization check failed - need to add minter role");
    }
  }
  
  // Check if we can add minter (only if we're the owner)
  console.log("\n=== Attempting to add minter role ===");
  try {
    const tx = await FlexCard.addMinter(relayerAddress);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Minter role added successfully");
    
    // Verify again
    const hasRoleNow = await FlexCard.minters(relayerAddress);
    console.log("Has minter role now:", hasRoleNow);
  } catch (error) {
    console.log("❌ Failed to add minter role:", error.message);
  }
}

main().catch(console.error);