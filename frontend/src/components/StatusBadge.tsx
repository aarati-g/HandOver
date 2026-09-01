import React from 'react';
import { cn } from '@/lib/utils';
import type { AssetStatus, ReadinessStatus } from '@/types';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AssetStatus | ReadinessStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  ...props
}) => {
  const getStatusConfig = (s: string) => {
    switch (s.toLowerCase()) {
      case 'operational':
      case 'ready':
      case 'healthy':
        return {
          label: s === 'operational' ? 'Operational' : 'Handover Ready',
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        };
      case 'needs_attention':
      case 'attention':
        return {
          label: 'Needs Attention',
          dot: 'bg-amber-500',
          badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
        };
      case 'almost_ready':
        return {
          label: 'Almost Ready',
          dot: 'bg-blue-500',
          badge: 'bg-blue-50 text-blue-800 border-blue-200/80',
        };
      case 'degraded':
      case 'offline':
      case 'critical':
      case 'incomplete':
        return {
          label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
          dot: 'bg-rose-500',
          badge: 'bg-rose-50 text-rose-800 border-rose-200/80',
        };
      default:
        return {
          label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
          dot: 'bg-slate-400',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border shadow-2xs',
        config.badge,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      <span>{config.label}</span>
    </span>
  );
};
