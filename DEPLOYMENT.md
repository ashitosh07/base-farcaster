# 🚀 Production Deployment Guide

## Prerequisites
- Base mainnet ETH (at least 0.01 ETH for deployment)
- Railway account
- Vercel account
- Production API keys (nft.storage, Pinata)

## 1. Deploy Smart Contract to Base Mainnet

```bash
cd contracts

# Update .env with mainnet keys
echo "BASE_RPC=https://mainnet.base.org" >> .env
echo "PRIVATE_KEY=0x..." >> .env  # Your mainnet deployer key
echo "ETHERSCAN_API_KEY=..." >> .env

# Deploy to Base mainnet
npx hardhat run scripts/deployMainnet.js --network base

# Verify contract (use address from deployment output)
npx hardhat verify --network base <CONTRACT_ADDRESS> "FlexCard" "FLEX"
```

## 2. Deploy Backend to Railway

```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init
railway link

# Set environment variables
railway variables set CONTRACT_ADDRESS=<MAINNET_CONTRACT_ADDRESS>
railway variables set BASE_RPC=https://mainnet.base.org
railway variables set RELAYER_PRIVATE_KEY=<MAINNET_RELAYER_KEY>
railway variables set NFT_STORAGE_KEY=<YOUR_KEY>
railway variables set PINATA_KEY=<YOUR_KEY>
railway variables set PINATA_SECRET=<YOUR_SECRET>
railway variables set API_KEY_ADMIN=<SECURE_ADMIN_KEY>

# Deploy
railway up
```

## 3. Add Minter Role

```bash
cd contracts

# Create script to add mainnet relayer as minter
# Update addMinter.js with your mainnet relayer address
npx hardhat run scripts/addMinter.js --network base
```

## 4. Deploy Frontend to Vercel

```bash
cd frontend-vite

# Update .env.production with your deployed backend URL
# VITE_API_URL=https://your-railway-app.railway.app
# VITE_CONTRACT_ADDRESS=<MAINNET_CONTRACT_ADDRESS>

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 5. Test Production Deployment

1. Visit your Vercel URL
2. Connect wallet to Base mainnet
3. Try minting a FlexCard
4. Verify NFT appears in wallet
5. Test Farcaster sharing

## 6. Submit to Base Ecosystem

Visit [Base Ecosystem](https://base.org/ecosystem) and submit:
- App name: FlexCard
- URL: Your Vercel deployment
- Description: "Mint personalized NFT cards on Base"
- Contract: Your mainnet contract address

## Security Checklist

- ✅ Use dedicated relayer key (not owner key)
- ✅ Store private keys securely
- ✅ Enable rate limiting
- ✅ Monitor contract for unusual activity
- ✅ Set up alerts for failed transactions

## Monitoring

- Railway dashboard for backend metrics
- Vercel analytics for frontend usage
- Basescan for contract transactions
- Set up Discord/Slack alerts for errors