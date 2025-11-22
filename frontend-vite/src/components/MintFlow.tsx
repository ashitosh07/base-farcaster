import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Loader2, CheckCircle, ExternalLink, Share2 } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { apiClient } from '../lib/api';
import type { CardData } from '../lib/canvas';

interface MintFlowProps {
  imageData: string;
  cardData: CardData;
  templatePrice: number;
  onComplete: () => void;
}

type MintStep = 'preview' | 'pinning' | 'minting' | 'success' | 'error';

export default function MintFlow({ imageData, cardData, templatePrice, onComplete }: MintFlowProps) {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState<MintStep>('preview');
  const [txHash, setTxHash] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);

  const startMinting = async () => {
    if (!address) {
      setError('Please connect your wallet');
      setCurrentStep('error');
      return;
    }

    try {
      // Step 1: Pin to IPFS
      setCurrentStep('pinning');
      
      const metadata = {
        name: `FlexCard - @${cardData.handle}`,
        description: `FlexCard for ${cardData.handle}: ${cardData.tagline}`,
        attributes: [
          { trait_type: 'Template', value: cardData.templateId },
          { trait_type: 'Handle', value: cardData.handle },
          { trait_type: 'Followers', value: cardData.stats.followers },
          { trait_type: 'Following', value: cardData.stats.following },
          { trait_type: 'Casts', value: cardData.stats.casts },
          { trait_type: 'Accent Color', value: cardData.accentColor },
        ],
      };

      const pinResponse = await apiClient.pinToIPFS({
        image: imageData,
        metadata,
      });

      // Step 2: Mint NFT
      setCurrentStep('minting');
      
      const mintResponse = await apiClient.mintNFT({
        to: address,
        tokenURI: pinResponse.tokenURI,
        templateId: cardData.templateId,
        pricePaid: templatePrice.toString(),
      });

      setTxHash(mintResponse.txHash);
      setTokenId(mintResponse.tokenId);
      setCurrentStep('success');

    } catch (err) {
      console.error('Minting failed:', err);
      setError(err instanceof Error ? err.message : 'Minting failed');
      setCurrentStep('error');
    }
  };

  const shareToFarcaster = async () => {
    setIsSharing(true);
    try {
      // Upload image to get public URL
      const response = await apiClient.uploadTempImage({ image: imageData });
      
      const text = `Just minted my FlexCard NFT! 🎨✨\n\n@${cardData.handle}\nToken #${tokenId}\n\nMint yours at flexcard.app`;
      const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(response.imageUrl)}`;
      window.open(url, '_blank');
    } catch (error) {
      // Fallback without image
      const text = `Just minted my FlexCard NFT! 🎨✨\n\n@${cardData.handle}\nToken #${tokenId}\n\nMint yours at flexcard.app`;
      const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } finally {
      setIsSharing(false);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'preview':
        return (
          <div className="text-center space-y-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <img src={imageData} alt="FlexCard Preview" className="mx-auto rounded-lg shadow-lg" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Ready to Mint</h3>
              <p className="text-gray-600">
                Your FlexCard will be minted as an NFT on Base Sepolia
              </p>
              <p className="text-sm text-gray-500">
                Price: {templatePrice} ETH
              </p>
            </div>

            <Button onClick={startMinting} size="lg" className="w-full">
              Mint FlexCard NFT
            </Button>
          </div>
        );

      case 'pinning':
        return (
          <div className="text-center space-y-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
            <div>
              <h3 className="text-xl font-bold">Uploading to IPFS</h3>
              <p className="text-gray-600">Storing your FlexCard metadata...</p>
            </div>
          </div>
        );

      case 'minting':
        return (
          <div className="text-center space-y-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
            <div>
              <h3 className="text-xl font-bold">Minting NFT</h3>
              <p className="text-gray-600">Creating your FlexCard on Base...</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <div>
              <h3 className="text-2xl font-bold text-green-600">Success!</h3>
              <p className="text-gray-600">Your FlexCard NFT has been minted</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <img src={imageData} alt="Your FlexCard" className="mx-auto rounded-lg shadow-lg max-w-full h-auto" style={{ maxHeight: '300px' }} />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Token ID:</span>
                <span className="font-mono">#{tokenId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transaction:</span>
                <a
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 flex items-center"
                >
                  View <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={shareToFarcaster} variant="outline" className="flex-1" disabled={isSharing}>
                {isSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                {isSharing ? 'Uploading...' : 'Share on Farcaster'}
              </Button>
              <Button onClick={onComplete} className="flex-1">
                Create Another
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-600">Minting Failed</h3>
              <p className="text-gray-600">{error}</p>
            </div>
            <Button onClick={() => setCurrentStep('preview')} variant="outline">
              Try Again
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <Card className="p-8">
        {getStepContent()}
      </Card>
    </motion.div>
  );
}