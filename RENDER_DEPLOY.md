# 🚀 Deploy FlexCard API to Render

## Step 1: Push to GitHub
Make sure your code is pushed to GitHub repository.

## Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your `base-farcaster` repository
5. Configure:
   - **Name**: flexcard-api
   - **Region**: Singapore (closest to you)
   - **Branch**: main
   - **Runtime**: Docker
   - **Dockerfile Path**: ./Dockerfile

## Step 3: Set Environment Variables
In Render dashboard, add these environment variables:

```
CONTRACT_ADDRESS = YOUR_MAINNET_CONTRACT_ADDRESS
BASE_RPC = https://mainnet.base.org
RELAYER_PRIVATE_KEY = YOUR_MAINNET_RELAYER_PRIVATE_KEY
NFT_STORAGE_KEY = YOUR_NFT_STORAGE_KEY
PINATA_KEY = YOUR_PINATA_KEY
PINATA_SECRET = YOUR_PINATA_SECRET
API_KEY_ADMIN = YOUR_SECURE_ADMIN_KEY
```

## Step 4: Deploy
Click "Create Web Service" - Render will automatically build and deploy.

## Step 5: Get Your API URL
After deployment, you'll get a URL like:
`https://flexcard-api.onrender.com`

## Step 6: Update Frontend
Update your frontend `.env.production`:
```
VITE_API_URL=https://flexcard-api.onrender.com
```

## Render Free Tier:
- 512MB RAM
- Sleeps after 15 minutes of inactivity
- Automatic SSL certificates
- GitHub auto-deploy on push

## Test Your API
Visit: `https://flexcard-api.onrender.com/swagger`