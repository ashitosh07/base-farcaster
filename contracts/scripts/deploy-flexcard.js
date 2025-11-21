const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FlexCardNFT contract...");
  
  // Get the contract factory
  const FlexCardNFT = await ethers.getContractFactory("FlexCardNFT");
  
  // Deploy the contract
  const flexCard = await FlexCardNFT.deploy();
  await flexCard.waitForDeployment();
  
  const contractAddress = await flexCard.getAddress();
  console.log("FlexCardNFT deployed to:", contractAddress);
  
  // Wait for a few confirmations
  console.log("Waiting for confirmations...");
  await flexCard.deploymentTransaction().wait(3);
  
  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", deployer.address);
  
  // Verify roles
  const DEFAULT_ADMIN_ROLE = await flexCard.DEFAULT_ADMIN_ROLE();
  const MINTER_ROLE = await flexCard.MINTER_ROLE();
  
  console.log("Contract owner has admin role:", await flexCard.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
  console.log("Contract owner has minter role:", await flexCard.hasRole(MINTER_ROLE, deployer.address));
  
  console.log("\n=== NEXT STEPS ===");
  console.log("1. Verify contract on Basescan:");
  console.log(`   npx hardhat verify --network baseSepolia ${contractAddress}`);
  console.log("\n2. Add relayer as minter:");
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Function: addMinter(0x742d35Cc6634C0532925a3b8D6Ac6E7D9C8b5c6f)`);
  console.log("\n3. Update backend config:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });