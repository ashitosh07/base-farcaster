const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const relayerAddress = "0x8a547Feb8B9AC2a7F137a0aBab94da6051aFAdF6";
  
  const balance = await provider.getBalance(relayerAddress);
  const balanceEth = ethers.formatEther(balance);
  
  console.log("Relayer address:", relayerAddress);
  console.log("Balance:", balanceEth, "ETH");
  console.log("Has sufficient gas:", parseFloat(balanceEth) > 0.001);
}

main().catch(console.error);