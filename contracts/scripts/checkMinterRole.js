const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc";
  const relayerAddress = "0x8a547Feb8B9AC2a7F137a0aBab94da6051aFAdF6";
  
  const FlexCard = await ethers.getContractAt("FlexCard", contractAddress);
  
  console.log("Contract:", contractAddress);
  console.log("Relayer:", relayerAddress);
  
  const hasMinterRole = await FlexCard.minters(relayerAddress);
  console.log("Has minter role:", hasMinterRole);
  
  const owner = await FlexCard.owner();
  console.log("Contract owner:", owner);
}

main().catch(console.error);