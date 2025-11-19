// import html2canvas from 'html2canvas';

export interface CardData {
  handle: string;
  tagline: string;
  accentColor: string;
  avatar?: string;
  stats: {
    followers: number;
    following: number;
    casts: number;
  };
  templateId: string;
}

export const generateCardImage = async (cardData: CardData): Promise<string> => {
  // Create a temporary canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas context not available');

  // Set canvas dimensions
  canvas.width = 600;
  canvas.height = 400;

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, cardData.accentColor);
  gradient.addColorStop(1, '#1a1a1a');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add glass effect overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Draw avatar if provided
  if (cardData.avatar) {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 100, 40, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(img, 60, 60, 80, 80);
      ctx.restore();
    };
    img.src = cardData.avatar;
  } else {
    // Default avatar circle
    ctx.fillStyle = cardData.accentColor;
    ctx.beginPath();
    ctx.arc(100, 100, 40, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Draw handle
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.fillText(`@${cardData.handle}`, 160, 90);

  // Draw tagline
  ctx.fillStyle = '#cccccc';
  ctx.font = '18px Inter, sans-serif';
  ctx.fillText(cardData.tagline, 160, 120);

  // Draw stats
  const statsY = 200;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Inter, sans-serif';
  
  ctx.fillText(`${cardData.stats.followers}`, 80, statsY);
  ctx.fillText(`${cardData.stats.following}`, 250, statsY);
  ctx.fillText(`${cardData.stats.casts}`, 420, statsY);

  ctx.fillStyle = '#cccccc';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText('Followers', 80, statsY + 25);
  ctx.fillText('Following', 250, statsY + 25);
  ctx.fillText('Casts', 420, statsY + 25);

  // Add FlexCard branding
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.fillText('FlexCard', 50, canvas.height - 30);

  // Convert to base64
  return canvas.toDataURL('image/png');
};

export const generateCardFromElement = async (element: HTMLElement): Promise<string> => {
  // Fallback implementation without html2canvas
  // In production, install html2canvas: npm install html2canvas
  console.warn('html2canvas not available, using fallback');
  
  // Create a simple canvas as fallback
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Canvas context not available');
  
  canvas.width = 600;
  canvas.height = 400;
  
  // Simple fallback rendering
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText('FlexCard Preview', 200, 200);
  
  return canvas.toDataURL('image/png');
};