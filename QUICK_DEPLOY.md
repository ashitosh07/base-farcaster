# Quick Deploy to Production (Base Sepolia)

## 1. Deploy Backend to Railway (5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready FlexCard"
git push origin main
```

### Step 2: Railway Setup
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `base-farcaster` repo
5. Choose `backend` folder as root directory

### Step 3: Set Environment Variables
In Railway dashboard, go to Variables tab and add:
```
CONTRACT_ADDRESS=0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc
BASE_RPC=https://sepolia.base.org
RELAYER_PRIVATE_KEY=0x742d35Cc6634C0532925a3b8D6Ac6E7D9C8b5c6f
NFT_STORAGE_KEY=your-nft-storage-key
PINATA_KEY=your-pinata-key
PINATA_SECRET=your-pinata-secret
API_KEY_ADMIN=your-strong-admin-key
```

### Step 4: Deploy
Railway will auto-deploy. Copy the generated URL (e.g., `https://backend-production-xxxx.up.railway.app`)

## 2. Deploy Frontend to Vercel (3 minutes)

### Step 1: Update Environment
```bash
cd frontend-vite
# Create production env file
echo "VITE_API_URL=https://your-railway-url.railway.app" > .env.production
echo "VITE_CONTRACT_ADDRESS=0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc" >> .env.production
echo "VITE_CHAIN_ID=84532" >> .env.production
echo "VITE_RPC_URL=https://sepolia.base.org" >> .env.production
```

### Step 2: Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Step 3: Set Environment Variables
In Vercel dashboard, add the same environment variables from `.env.production`

## 3. Test Your Live App (2 minutes)

1. Visit your Vercel URL
2. Connect wallet to Base Sepolia
3. Get testnet ETH from [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
4. Create and mint a FlexCard
5. Share on Farcaster

## 4. Get API Keys (if needed)

### NFT.Storage
1. Go to [nft.storage](https://nft.storage)
2. Sign up and create API key

### Pinata
1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up and get API key + secret

## Your Live URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **API Docs**: `https://your-backend.railway.app/swagger`

## Share Your FlexCard App
- Post on Farcaster: "Just launched FlexCard! Create your personalized NFT at [your-url]"
- Share in Base community
- Add to your bio/portfolio

**Total Time**: ~10 minutes to go live! 🚀