const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying FlexCard to Base Mainnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient ETH for deployment. Need at least 0.01 ETH for gas.");
  }
  
  // Deploy FlexCard
  const FlexCard = await ethers.getContractFactory("FlexCard");
  const flexCard = await FlexCard.deploy("FlexCard", "FLEX");
  
  await flexCard.waitForDeployment();
  const contractAddress = await flexCard.getAddress();
  
  console.log("✅ FlexCard deployed to:", contractAddress);
  console.log("📝 Transaction hash:", flexCard.deploymentTransaction().hash);
  
  // Save deployment info
  const deploymentInfo = {
    network: "base",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentHash: flexCard.deploymentTransaction().hash,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync('mainnet-deployment.json', JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🔧 Next steps:");
  console.log("1. Verify contract:", `npx hardhat verify --network base ${contractAddress} "FlexCard" "FLEX"`);
  console.log("2. Update backend CONTRACT_ADDRESS to:", contractAddress);
  console.log("3. Update frontend VITE_CONTRACT_ADDRESS to:", contractAddress);
  console.log("4. Add minter role for relayer address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });