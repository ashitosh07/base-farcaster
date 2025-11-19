# FlexCard - Farcaster Frame + Base NFT Minting

A complete production-ready FlexCard product that lets users preview personalized Flex Cards and mint premium onchain NFTs (ERC-721) on Base.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- PostgreSQL (for production) or SQLite (for development)

### Installation

#### 1. Frontend Dependencies
```bash
cd frontend-vite
npm install wagmi viem @rainbow-me/rainbowkit @tanstack/react-query axios html2canvas
```

#### 2. Backend Dependencies
```bash
cd backend
dotnet add package Nethereum.Web3
dotnet add package Nethereum.Accounts
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet restore
```

#### 3. Contract Dependencies
```bash
cd contracts
npm install @openzeppelin/contracts hardhat @nomiclabs/hardhat-ethers ethers
```

### Environment Setup

#### Frontend (.env.local)
```bash
cp frontend-vite/.env.example frontend-vite/.env.local
```
Edit `.env.local`:
```
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ADDRESS=0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc
VITE_CHAIN_ID=84532
VITE_RPC_URL=https://sepolia.base.org
```

#### Backend (appsettings.json)
Update `backend/appsettings.json` with real values:
```json
{
  "CONTRACT_ADDRESS": "0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc",
  "BASE_RPC": "https://sepolia.base.org",
  "RELAYER_PRIVATE_KEY": "your-private-key-here",
  "NFT_STORAGE_KEY": "your-nft-storage-key",
  "PINATA_KEY": "your-pinata-key",
  "PINATA_SECRET": "your-pinata-secret",
  "API_KEY_ADMIN": "your-admin-key",
  "ConnectionStrings": {
    "DefaultConnection": "your-database-connection-string"
  }
}
```

### Running the Application

#### Development Mode
```bash
# Terminal 1: Backend
cd backend
dotnet run

# Terminal 2: Frontend
cd frontend-vite
npm run dev
```

#### Production Build
```bash
# Frontend
cd frontend-vite
npm run build

# Backend
cd backend
dotnet publish -c Release
```

## 🏗️ Architecture

- **Frontend**: Vite + React + Tailwind + Framer Motion + Wagmi + RainbowKit
- **Backend**: .NET 8 Minimal API with Nethereum blockchain integration
- **Smart Contract**: ERC-721 on Base Sepolia with minter role system
- **IPFS**: nft.storage + Pinata for metadata and image storage
- **Database**: PostgreSQL (production) / SQLite (development)
- **Wallet**: RainbowKit with WalletConnect support

## 🔑 Required Environment Variables

### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:5000                    # Backend API URL
VITE_CONTRACT_ADDRESS=0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc  # FlexCard contract
VITE_CHAIN_ID=84532                                   # Base Sepolia chain ID
VITE_RPC_URL=https://sepolia.base.org                 # Base Sepolia RPC
```

### Backend (appsettings.json)
```json
{
  "CONTRACT_ADDRESS": "0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc",
  "BASE_RPC": "https://sepolia.base.org",
  "RELAYER_PRIVATE_KEY": "0x...",              // Dedicated relayer key (NOT owner key)
  "NFT_STORAGE_KEY": "...",                    // nft.storage API key
  "PINATA_KEY": "...",                         // Pinata API key
  "PINATA_SECRET": "...",                      // Pinata secret key
  "API_KEY_ADMIN": "...",                      // Admin API key for stats
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=flexcard.db"  // SQLite for dev, PostgreSQL for prod
  }
}
```

### Contracts (.env)
```bash
BASE_SEPOLIA_RPC=https://sepolia.base.org
PRIVATE_KEY=0x...                                     # Deployer private key
ETHERSCAN_API_KEY=...                                 # For contract verification
```

### How to Get API Keys

1. **nft.storage**: Sign up at [nft.storage](https://nft.storage) and create an API key
2. **Pinata**: Sign up at [pinata.cloud](https://pinata.cloud) and get API credentials
3. **Base Sepolia ETH**: Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
4. **Private Keys**: Use a dedicated wallet for development (never use mainnet keys)

## 🚀 Deployment Guide

### 1. Smart Contract Deployment
```bash
cd contracts
# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia

# Verify contract
npx hardhat verify --network baseSepolia 0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc
```

### 2. Configure Minter Role (CRITICAL SECURITY STEP)

**Relayer Address:** `0x742d35Cc6634C0532925a3b8D6Ac6E7D9C8b5c6f`

**Option A: Using Basescan (Recommended)**
1. Go to [Base Sepolia Contract](https://sepolia.basescan.org/address/0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc#writeContract)
2. Click "Connect to Web3" and connect your contract owner wallet
3. Find the `addMinter` function
4. Enter relayer address: `0x742d35Cc6634C0532925a3b8D6Ac6E7D9C8b5c6f`
5. Click "Write" and confirm transaction

**Option B: Using Hardhat Script**
```javascript
// scripts/addMinter.js
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc";
  const relayerAddress = "0x742d35Cc6634C0532925a3b8D6Ac6E7D9C8b5c6f";
  
  const FlexCard = await ethers.getContractAt("FlexCard", contractAddress);
  const tx = await FlexCard.addMinter(relayerAddress);
  await tx.wait();
  
  console.log(`Minter role granted to ${relayerAddress}`);
}

main().catch(console.error);
```

**Why This Approach is Safer:**
- **Principle of Least Privilege**: Relayer can only mint, not transfer ownership or pause contract
- **Key Separation**: Owner key stays secure, relayer key can be rotated if compromised
- **Scalable**: Multiple relayers can be added without exposing owner privileges
- **Industry Standard**: Used by OpenSea, Zora, Manifold for production systems

### 3. Backend Deployment (Railway)
```bash
cd backend

# Create Dockerfile if needed
echo 'FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY . .
EXPOSE 80
ENTRYPOINT ["dotnet", "FlexCard.API.dll"]' > Dockerfile

# Deploy to Railway
# 1. Connect GitHub repo to Railway
# 2. Set environment variables in Railway dashboard
# 3. Deploy automatically on push
```

**Railway Environment Variables:**
```
CONTRACT_ADDRESS=0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc
BASE_RPC=https://sepolia.base.org
RELAYER_PRIVATE_KEY=0x...
NFT_STORAGE_KEY=...
PINATA_KEY=...
PINATA_SECRET=...
API_KEY_ADMIN=...
DATABASE_URL=postgresql://...
```

### 4. Frontend Deployment (Vercel)
```bash
cd frontend-vite

# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

**Vercel Environment Variables:**
```
VITE_API_URL=https://your-railway-app.railway.app
VITE_CONTRACT_ADDRESS=0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc
VITE_CHAIN_ID=84532
VITE_RPC_URL=https://sepolia.base.org
```

### 5. Database Setup (PostgreSQL)
```sql
-- Create database
CREATE DATABASE flexcard;

-- Tables will be created automatically by Entity Framework
-- on first run via context.Database.EnsureCreated()
```

## 🚀 Complete End-to-End Workflow

### User Journey
1. **Connect Wallet**: User connects wallet via RainbowKit
2. **Select Template**: Choose from Basic (free), Premium ($0.001 ETH), or Animated ($0.002 ETH)
3. **Customize Card**: Enter handle, tagline, stats, upload avatar, choose colors
4. **Generate Preview**: Canvas renders the FlexCard image
5. **Mint NFT**: 
   - Frontend sends image + metadata to `/api/pin`
   - Backend uploads to IPFS via nft.storage/Pinata
   - Frontend calls `/api/mint` with user's wallet address
   - Backend calls `contract.mintTo(userAddress, tokenURI)`
   - Returns transaction hash and token ID
6. **Success & Share**: Display success screen with Farcaster share option

### API Endpoints

- `GET /api/stats` - Get platform statistics (total mints, active users, templates)
- `GET /api/templates` - Get available templates with pricing
- `POST /api/pin` - Pin image + metadata to IPFS, returns CID and tokenURI
- `POST /api/mint` - Mint NFT on Base Sepolia, returns txHash and tokenId
- `POST /api/relay/submit` - Submit meta-transaction (with EIP-712 verification)
- `GET /api/admin/mints` - Admin analytics (requires API key)

## 🧪 Testing the Complete Flow

### 1. Smart Contract Testing
```bash
cd contracts
npx hardhat test                    # Run contract tests
npx hardhat run scripts/deploy.js --network baseSepolia  # Deploy to testnet
```

### 2. Backend Testing
```bash
cd backend
dotnet test                         # Run unit tests
dotnet run                          # Start API server
# Test endpoints at http://localhost:5000/swagger
```

### 3. Frontend Testing
```bash
cd frontend-vite
npm run dev                         # Start frontend
# Open http://localhost:5173
```

### 4. End-to-End Testing Checklist

✅ **Wallet Connection**
- [ ] RainbowKit modal opens
- [ ] Wallet connects successfully
- [ ] Address displays in header

✅ **Template Selection**
- [ ] Templates load from `/api/templates`
- [ ] Pricing displays correctly
- [ ] Template selection navigates to editor

✅ **Card Editor**
- [ ] All form fields work (handle, tagline, colors, stats)
- [ ] Avatar upload works
- [ ] Preview generation creates canvas image

✅ **Minting Flow**
- [ ] IPFS upload succeeds (check network tab)
- [ ] Mint transaction submits to Base Sepolia
- [ ] Transaction hash returns
- [ ] Success screen shows with correct token ID
- [ ] Farcaster share link works

✅ **Admin Dashboard**
- [ ] `/api/stats` returns real data
- [ ] Mint records persist in database
- [ ] Admin endpoint requires authentication

## Security Notes

- Store private keys in secure vaults
- Rate limiting enabled (10 mints/hour/IP)
- Input sanitization for SVG uploads
- EIP-712 signature verification
- Consider HSM for production relayer

## Troubleshooting

### Common Issues
1. **IPFS Upload Fails**: Check NFT_STORAGE_KEY
2. **Mint Transaction Fails**: Verify contract address and relayer balance
3. **Frame Not Loading**: Ensure mobile-first responsive design
4. **Meta-tx Signature Invalid**: Check EIP-712 domain parameters

### Rollback Steps
1. Pause minting via admin endpoint
2. Deploy previous contract version
3. Update frontend CONTRACT_ADDRESS
4. Verify functionality on testnet first

## Admin Tasks

```bash
# Check mint stats
curl -H "Authorization: Bearer $API_KEY_ADMIN" https://api.flexcard.app/api/admin/mints

# Emergency pause (if implemented)
curl -X POST -H "Authorization: Bearer $API_KEY_ADMIN" https://api.flexcard.app/api/admin/pause
```

## 📊 Production Readiness Checklist

### Security
- ✅ Private keys stored securely (not in code)
- ✅ CORS configured for specific origins only
- ✅ API rate limiting implemented
- ✅ Input validation on all endpoints
- ✅ EIP-712 signature verification for meta-transactions

### Performance
- ✅ Database indexes on frequently queried fields
- ✅ Image optimization and compression
- ✅ IPFS pinning with redundancy
- ✅ Frontend code splitting and lazy loading

### Monitoring
- ✅ Transaction receipt polling with timeout
- ✅ Error logging and alerting
- ✅ API endpoint monitoring
- ✅ Database connection health checks

### Scalability
- ✅ Stateless backend design
- ✅ Database connection pooling
- ✅ CDN for static assets
- ✅ Horizontal scaling ready

## 🐛 Troubleshooting

### Common Issues

**Frontend not connecting to backend:**
- Check `VITE_API_URL` in `.env.local`
- Verify backend is running on correct port
- Check CORS configuration in backend

**Wallet connection fails:**
- Ensure user is on Base Sepolia network
- Check `VITE_CHAIN_ID` matches Base Sepolia (84532)
- Verify RainbowKit configuration

**IPFS upload fails:**
- Verify `NFT_STORAGE_KEY` or Pinata credentials
- Check image size (should be < 10MB)
- Ensure base64 image format is correct

**Mint transaction fails:**
- **"Not authorized to mint"**: Relayer address needs minter role - see deployment guide
- Verify contract address is correct
- Check relayer wallet has sufficient ETH for gas
- Verify Base Sepolia RPC is accessible

**Stats not loading:**
- Check database connection
- Verify `/api/stats` endpoint is accessible
- Check for CORS issues

## 📝 License

MIT License - see LICENSE file for details