import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GlowingCardProps {
  children: ReactNode;
  glowColor?: string;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export default function GlowingCard({ 
  children, 
  glowColor = 'blue', 
  className = '',
  intensity = 'medium'
}: GlowingCardProps) {
  const glowColors = {
    blue: 'shadow-blue-500/25',
    purple: 'shadow-purple-500/25',
    pink: 'shadow-pink-500/25',
    green: 'shadow-green-500/25',
    orange: 'shadow-orange-500/25',
  };

  const intensities = {
    low: 'shadow-lg',
    medium: 'shadow-xl',
    high: 'shadow-2xl'
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl bg-white/90 backdrop-blur-sm border border-white/20 overflow-hidden group',
        intensities[intensity],
        glowColors[glowColor as keyof typeof glowColors],
        className
      )}
      whileHover={{ 
        scale: 1.02,
        boxShadow: intensity === 'high' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : undefined
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  );
}