import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Sparkles, Users, Zap, Palette, Coins } from 'lucide-react';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import StatsCard from './components/advanced/StatsCard';
import AnimatedCounter from './components/advanced/AnimatedCounter';
import GlowingCard from './components/advanced/GlowingCard';
import CardEditor from './components/CardEditor';
import MintFlow from './components/MintFlow';
import { config } from './lib/wagmi';
import { apiClient } from './lib/api';
import type { Template } from './lib/api';
import type { CardData } from './lib/canvas';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

type AppStep = 'landing' | 'templates' | 'editor' | 'mint';

interface AppStats {
  totalMints: number;
  activeUsers: number;
  templates: number;
}

function AppContent() {
  const [step, setStep] = useState<AppStep>('landing');
  const [stats, setStats] = useState<AppStats | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [statsData, templatesData] = await Promise.all([
        apiClient.getStats(),
        apiClient.getTemplates(),
      ]);
      setStats(statsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setStep('editor');
  };

  const handlePreviewGenerated = (imageData: string, cardData: CardData) => {
    setGeneratedImage(imageData);
    setCardData(cardData);
    setStep('mint');
  };

  const handleMintComplete = () => {
    setStep('landing');
    setSelectedTemplate(null);
    setGeneratedImage('');
    setCardData(null);
    loadInitialData(); // Refresh stats
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg" />
            <span className="text-xl font-bold text-gray-900">FlexCard</span>
          </div>
          
          <ConnectButton />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 pb-12">
        {step === 'landing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Hero section */}
            <div className="mb-16">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
              >
                Make a FlexCard.{' '}
                <span className="gradient-text">Mint.</span>{' '}
                <span className="gradient-text">Flex.</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              >
                Create personalized FlexCards and mint them as premium NFTs on Base. 
                Show off your Farcaster stats and flex your onchain identity.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
              >
                <Button
                  size="xl"
                  onClick={() => setStep('templates')}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Preview your card
                </Button>
              </motion.div>
            </div>

            {/* Stats Section */}
            {stats && (
              <div className="grid md:grid-cols-3 gap-6 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <StatsCard
                    title="Total Minted"
                    value={<AnimatedCounter value={stats.totalMints} />}
                    change={12}
                    changeType="increase"
                    icon={<Coins className="w-6 h-6" />}
                    color="blue"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <StatsCard
                    title="Active Users"
                    value={<AnimatedCounter value={stats.activeUsers} />}
                    change={8}
                    changeType="increase"
                    icon={<Users className="w-6 h-6" />}
                    color="green"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <StatsCard
                    title="Templates"
                    value={<AnimatedCounter value={stats.templates} />}
                    icon={<Palette className="w-6 h-6" />}
                    color="purple"
                  />
                </motion.div>
              </div>
            )}

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <GlowingCard glowColor="purple" intensity="medium">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Premium Templates</h3>
                    <p className="text-gray-600">Choose from static and animated templates with premium effects</p>
                  </div>
                </GlowingCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <GlowingCard glowColor="blue" intensity="medium">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Base NFTs</h3>
                    <p className="text-gray-600">Mint directly on Base with sponsored gas fees</p>
                  </div>
                </GlowingCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <GlowingCard glowColor="green" intensity="medium">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Farcaster Ready</h3>
                    <p className="text-gray-600">Share directly to Farcaster with one click</p>
                  </div>
                </GlowingCard>
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Template</h2>
            <p className="text-gray-600 mb-8">Select a template to customize your FlexCard</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} hover className="cursor-pointer" onClick={() => handleTemplateSelect(template)}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{template.description}</p>
                    <p className="text-sm font-medium text-blue-600">
                      {template.price === 0 ? 'Free' : `${template.price} ETH`}
                    </p>
                    {template.premium && (
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-2">
                        Premium
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'editor' && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CardEditor
              template={selectedTemplate}
              onPreviewGenerated={handlePreviewGenerated}
            />
          </motion.div>
        )}

        {step === 'mint' && generatedImage && cardData && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MintFlow
              imageData={generatedImage}
              cardData={cardData}
              templatePrice={selectedTemplate.price}
              onComplete={handleMintComplete}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;