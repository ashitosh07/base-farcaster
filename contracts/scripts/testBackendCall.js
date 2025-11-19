const { ethers } = require("ethers");

async function main() {
  // Use same config as backend
  const rpcUrl = "https://sepolia.base.org";
  const privateKey = "0x0add90ecd66fbde38863674027f9510e25bd301a3f941c583347250ce5af8d4d";
  const contractAddress = "0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc";
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Wallet address:", wallet.address);
  
  // Same ABI as backend
  const abi = [
    {
      "inputs": [
        {"internalType": "address", "name": "to", "type": "address"},
        {"internalType": "string", "name": "tokenURI", "type": "string"}
      ],
      "name": "mintTo",
      "outputs": [
        {"internalType": "uint256", "name": "", "type": "uint256"}
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  try {
    console.log("Testing mintTo call...");
    const testAddress = "0x742D35CC6634C0532925A3B8D6ac6e7D9C8B5C6f";
    const testURI = "ipfs://QmTest123";
    
    // Estimate gas first
    const gasEstimate = await contract.mintTo.estimateGas(testAddress, testURI);
    console.log("Gas estimate:", gasEstimate.toString());
    
    // Send transaction
    const tx = await contract.mintTo(testAddress, testURI);
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction successful!");
    console.log("Block number:", receipt.blockNumber);
    
  } catch (error) {
    console.log("❌ Transaction failed:", error.message);
    
    if (error.message.includes("Not authorized to mint")) {
      console.log("🔍 Authorization issue detected");
    }
  }
}

main().catch(console.error);