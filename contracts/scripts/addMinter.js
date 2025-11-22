const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc";
  const relayerAddress = process.env.RELAYER_ADDRESS || "0x742d35Cc6634C0532925a3b8D6Ac6E7D9C8b5c6f";
  
  console.log("Adding minter role...");
  console.log("Contract:", contractAddress);
  console.log("Relayer:", relayerAddress);
  
  const FlexCard = await ethers.getContractAt("FlexCard", contractAddress);
  
  // Check if already minter
  const isMinter = await FlexCard.isMinter(relayerAddress);
  if (isMinter) {
    console.log("✅ Already has minter role");
    return;
  }
  
  // Add minter role
  const tx = await FlexCard.addMinter(relayerAddress);
  console.log("Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ Minter role granted successfully");
  
  // Verify
  const isNowMinter = await FlexCard.isMinter(relayerAddress);
  console.log("Verification:", isNowMinter ? "✅ Success" : "❌ Failed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });