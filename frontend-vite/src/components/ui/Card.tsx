import { type HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
    const baseClasses = 'rounded-2xl transition-all duration-200';
    
    const variants = {
      default: 'bg-white border border-gray-200',
      elevated: 'bg-white shadow-lg hover:shadow-xl',
      outlined: 'bg-white border-2 border-gray-300',
      glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg'
    };
    
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };

    const Component = hover ? motion.div : 'div';
    const motionProps = hover ? {
      whileHover: { y: -2, scale: 1.01 },
      transition: { duration: 0.2 }
    } : {};

    return (
      <Component
        ref={ref}
        className={cn(baseClasses, variants[variant], paddings[padding], className)}
        {...motionProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export default Card;