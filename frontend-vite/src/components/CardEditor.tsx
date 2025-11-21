import { useState, useRef } from 'react';
import { Upload, Palette, Type, User } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import type { CardData } from '../lib/canvas';
import {  generateCardImage } from '../lib/canvas';
import type { Template } from '../lib/api';

interface CardEditorProps {
  template: Template;
  onPreviewGenerated: (imageData: string, cardData: CardData) => void;
}

export default function CardEditor({ template, onPreviewGenerated }: CardEditorProps) {
  const [cardData, setCardData] = useState<CardData>({
    handle: '',
    tagline: '',
    accentColor: '#3b82f6',
    stats: {
      followers: 0,
      following: 0,
      casts: 0,
    },
    templateId: template.id,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCardData(prev => ({
          ...prev,
          avatar: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePreview = async () => {
    if (!cardData.handle.trim()) {
      alert('Please enter a handle');
      return;
    }

    setIsGenerating(true);
    try {
      const imageData = await generateCardImage(cardData);
      onPreviewGenerated(imageData, cardData);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      alert('Failed to generate preview');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Customize Your FlexCard</h3>
          
          <div className="space-y-6">
            {/* Handle Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Farcaster Handle
              </label>
              <input
                type="text"
                value={cardData.handle}
                onChange={(e) => setCardData(prev => ({ ...prev, handle: e.target.value }))}
                placeholder="your-handle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tagline Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4 inline mr-2" />
                Tagline
              </label>
              <input
                type="text"
                value={cardData.tagline}
                onChange={(e) => setCardData(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="Your bio or tagline"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-2" />
                Accent Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={cardData.accentColor}
                  onChange={(e) => setCardData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={cardData.accentColor}
                  onChange={(e) => setCardData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-2" />
                Avatar (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                {cardData.avatar ? 'Change Avatar' : 'Upload Avatar'}
              </Button>
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farcaster Stats
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Followers</label>
                  <input
                    type="number"
                    value={cardData.stats.followers}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      stats: { ...prev.stats, followers: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Following</label>
                  <input
                    type="number"
                    value={cardData.stats.following}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      stats: { ...prev.stats, following: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Casts</label>
                  <input
                    type="number"
                    value={cardData.stats.casts}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      stats: { ...prev.stats, casts: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={generatePreview}
              disabled={isGenerating || !cardData.handle.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? 'Generating Preview...' : 'Generate Preview'}
            </Button>
          </div>
        </Card>

        {/* Preview Panel */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Preview</h3>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              Fill in your details and click "Generate Preview" to see your FlexCard
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}