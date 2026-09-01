import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  className,
  label = 'Loading operational memory...',
  size = 'md',
  ...props
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8 text-center space-y-3', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin text-blue-600', iconSizes[size])} />
      {label && <p className="text-xs font-medium text-slate-500 animate-pulse">{label}</p>}
    </div>
  );
};
