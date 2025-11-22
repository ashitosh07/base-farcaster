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
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    canvas.width = 600;
    canvas.height = 400;

    const drawCard = () => {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, cardData.accentColor);
      gradient.addColorStop(1, '#1a1a1a');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add glass effect overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Draw avatar placeholder
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(100, 100, 40, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = cardData.accentColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw handle
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.fillText(`@${cardData.handle}`, 160, 90);

      // Draw tagline
      ctx.fillStyle = '#cccccc';
      ctx.font = '18px Arial, sans-serif';
      const taglineText = cardData.tagline || 'Farcaster User';
      ctx.fillText(taglineText, 160, 120);

      // Draw stats background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(40, 180, canvas.width - 80, 80);

      // Draw stats
      const statsY = 220;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial, sans-serif';
      
      ctx.fillText(`${cardData.stats.followers.toLocaleString()}`, 80, statsY);
      ctx.fillText(`${cardData.stats.following.toLocaleString()}`, 250, statsY);
      ctx.fillText(`${cardData.stats.casts.toLocaleString()}`, 420, statsY);

      ctx.fillStyle = '#cccccc';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText('Followers', 80, statsY + 25);
      ctx.fillText('Following', 250, statsY + 25);
      ctx.fillText('Casts', 420, statsY + 25);

      // Add FlexCard branding
      ctx.fillStyle = cardData.accentColor;
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText('FlexCard', 50, canvas.height - 30);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillText('flexcard.app', 50, canvas.height - 10);
    };

    if (cardData.avatar) {
      const img = new Image();
      img.onload = () => {
        drawCard();
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 100, 40, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, 60, 60, 80, 80);
        ctx.restore();
        
        ctx.strokeStyle = cardData.accentColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(100, 100, 40, 0, 2 * Math.PI);
        ctx.stroke();
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        drawCard();
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = cardData.avatar;
    } else {
      drawCard();
      resolve(canvas.toDataURL('image/png'));
    }
  });
};

export const generateCardFromElement = async (_element: HTMLElement): Promise<string> => {
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