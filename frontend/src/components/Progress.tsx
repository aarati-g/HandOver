import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'auto' | 'brand' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'auto',
  showLabel = false,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const getAutoColor = (pct: number) => {
    if (pct >= 90) return 'bg-emerald-500';
    if (pct >= 75) return 'bg-blue-600';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const colorClass =
    variant === 'auto'
      ? getAutoColor(percentage)
      : {
          brand: 'bg-blue-600',
          success: 'bg-emerald-500',
          warning: 'bg-amber-500',
          danger: 'bg-rose-500',
        }[variant];

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700">
          <span>Readiness</span>
          <span className="font-semibold">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner', heightClass)}>
        <motion.div
          className={cn('h-full rounded-full transition-colors', colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
