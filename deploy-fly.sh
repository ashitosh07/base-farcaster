#!/bin/bash

echo "🚀 Deploying FlexCard API to Fly.io"
echo "==================================="

# Install flyctl if not installed
if ! command -v flyctl &> /dev/null; then
    echo "Installing flyctl..."
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
fi

# Login to Fly.io
echo "Please login to Fly.io:"
flyctl auth login

# Launch the app (creates app if doesn't exist)
echo "Launching app..."
flyctl launch --no-deploy

# Set environment variables
echo "Setting environment variables..."
flyctl secrets set CONTRACT_ADDRESS="REPLACE_WITH_MAINNET_CONTRACT"
flyctl secrets set BASE_RPC="https://mainnet.base.org"
flyctl secrets set RELAYER_PRIVATE_KEY="REPLACE_WITH_MAINNET_RELAYER_KEY"
flyctl secrets set NFT_STORAGE_KEY="REPLACE_WITH_YOUR_KEY"
flyctl secrets set PINATA_KEY="REPLACE_WITH_YOUR_KEY"
flyctl secrets set PINATA_SECRET="REPLACE_WITH_YOUR_SECRET"
flyctl secrets set API_KEY_ADMIN="REPLACE_WITH_SECURE_ADMIN_KEY"

# Deploy the app
echo "Deploying..."
flyctl deploy

echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "1. Update frontend VITE_API_URL with your Fly.io URL"
echo "2. Test the API endpoints"
echo "3. Deploy frontend to Vercel"