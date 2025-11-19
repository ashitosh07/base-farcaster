const { ethers } = require("hardhat");

async function main() {
  const privateKey = "0x0add90ecd66fbde38863674027f9510e25bd301a3f941c583347250ce5af8d4d";
  const wallet = new ethers.Wallet(privateKey);
  
  console.log("Private key:", privateKey);
  console.log("Derived address:", wallet.address);
  console.log("Expected relayer:", "0x742D35CC6634C0532925A3B8D6ac6e7D9C8B5C6f");
  console.log("Addresses match:", wallet.address.toLowerCase() === "0x742D35CC6634C0532925A3B8D6ac6e7D9C8B5C6f".toLowerCase());
}

main().catch(console.error);