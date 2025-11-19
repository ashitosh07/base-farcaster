const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FlexCard contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy the contract
  const FlexCard = await ethers.getContractFactory("FlexCard");
  const flexCard = await FlexCard.deploy("FlexCard", "FLEX");
  
  await flexCard.waitForDeployment();
  const contractAddress = await flexCard.getAddress();
  
  console.log("FlexCard deployed to:", contractAddress);
  
  // Set up minter role (optional - can be done later)
  const relayerAddress = process.env.RELAYER_ADDRESS;
  if (relayerAddress) {
    console.log("Adding relayer as minter:", relayerAddress);
    const tx = await flexCard.addMinter(relayerAddress);
    await tx.wait();
    console.log("Relayer added as minter");
  }
  
  // Log deployment info
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployedAt: new Date().toISOString(),
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\nDeployment info saved to deployment.json");
  
  // Verification command
  console.log("\nTo verify on Etherscan, run:");
  console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "FlexCard" "FLEX"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });