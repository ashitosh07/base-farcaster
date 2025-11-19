import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string | React.ReactNode;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
  color?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon, 
  color = 'blue' 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <Card variant="elevated" hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} text-white`}>
            {icon}
          </div>
        )}
      </div>
      
      <motion.div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1, delay: 0.2 }}
      />
    </Card>
  );
}