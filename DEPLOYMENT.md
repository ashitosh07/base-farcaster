# FlexCard Production Deployment Guide (Base Sepolia)

## 1. Use Existing Contract on Base Sepolia

### Current Contract
- **Address**: `0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Explorer**: https://sepolia.basescan.org/address/0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc

### Verify Minter Role
```bash
cd contracts
# Check if relayer has minter role
npx hardhat run scripts/addMinter.js --network baseSepolia
```

### Configure Minter Role
```bash
# Add relayer as minter (use production relayer address)
npx hardhat run scripts/addMinter.js --network base
```

## 2. Deploy Backend to Railway

### Environment Variables
```bash
CONTRACT_ADDRESS=0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc
BASE_RPC=https://sepolia.base.org
RELAYER_PRIVATE_KEY=0x...                # Production relayer key
NFT_STORAGE_KEY=...                      # Production API key
PINATA_KEY=...                           # Production API key
PINATA_SECRET=...                        # Production secret
API_KEY_ADMIN=...                        # Strong admin key
DATABASE_URL=postgresql://...            # PostgreSQL connection
```

### Deploy Steps
1. Push to GitHub
2. Connect Railway to GitHub repo
3. Set environment variables in Railway dashboard
4. Deploy automatically

## 3. Deploy Frontend to Vercel

### Environment Variables
```bash
VITE_API_URL=https://your-railway-app.railway.app
VITE_CONTRACT_ADDRESS=0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc
VITE_CHAIN_ID=84532                      # Base Sepolia
VITE_RPC_URL=https://sepolia.base.org
```

### Deploy Steps
```bash
cd frontend-vite

# Build and deploy
npm run build
npx vercel --prod
```

## 4. Update CORS Origins

Update backend CORS to include production domains:
```csharp
policy.WithOrigins(
    "https://your-domain.vercel.app",
    "https://flexcard.app"
)
```

## 5. Test Production Flow

1. Connect wallet to Base Sepolia
2. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
3. Test minting with testnet ETH
4. Verify NFT appears in wallet
5. Test Farcaster sharing
6. Check admin dashboard

## 6. Domain Setup (Optional)

### Custom Domain
1. Buy domain (flexcard.app)
2. Point to Vercel deployment
3. Update CORS origins
4. Update share links

## Production Checklist

- [x] Contract deployed to Base Sepolia
- [ ] Minter role configured
- [ ] Backend deployed with production env vars
- [ ] Frontend deployed with Sepolia config
- [ ] CORS updated for production domains
- [ ] End-to-end testing completed
- [ ] Admin dashboard accessible
- [ ] Monitoring setup

## Future Migration to Base Mainnet

When you have mainnet ETH:
1. Deploy contract to Base mainnet
2. Update environment variables
3. Redeploy frontend/backend
4. Users can mint on mainnet