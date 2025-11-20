# 🌐 Deploy Frontend to Vercel

## Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend-vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## Step 2: Environment Variables
Add these in Vercel dashboard:

```
VITE_API_URL = https://base-farcaster.onrender.com
VITE_CONTRACT_ADDRESS = 0x5C78f1422FEB39af04958375e43A62Fd6c395Cfc
VITE_CHAIN_ID = 84532
VITE_RPC_URL = https://sepolia.base.org
```

## Step 3: Deploy
Click "Deploy" - Vercel will build and deploy automatically.

## Your URLs:
- **Backend API**: https://base-farcaster.onrender.com
- **Frontend**: https://your-app.vercel.app (after deployment)

## Test Your App:
1. Visit your Vercel URL
2. Connect wallet to Base Sepolia
3. Try minting a FlexCard
4. Share to Farcaster

## For Mainnet (when ready):
Update environment variables to:
```
VITE_CHAIN_ID = 8453
VITE_RPC_URL = https://mainnet.base.org
VITE_CONTRACT_ADDRESS = YOUR_MAINNET_CONTRACT
```