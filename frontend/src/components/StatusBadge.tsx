import React from 'react';
import { Check, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
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
        return {
          label: 'Operational',
          icon: <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />,
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-semibold',
        };
      case 'ready':
      case 'healthy':
        return {
          label: 'Ready',
          icon: <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />,
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-semibold',
        };
      case 'needs_attention':
      case 'attention':
        return {
          label: 'Needs Attention',
          icon: <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />,
          badge: 'bg-amber-50 text-amber-900 border-amber-200/90 font-semibold',
        };
      case 'almost_ready':
        return {
          label: 'Almost Ready',
          icon: <Clock className="w-3 h-3 text-blue-600 shrink-0" />,
          badge: 'bg-blue-50 text-blue-800 border-blue-200/90 font-semibold',
        };
      case 'degraded':
      case 'offline':
      case 'critical':
      case 'incomplete':
        return {
          label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
          icon: <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />,
          badge: 'bg-rose-50 text-rose-800 border-rose-200/90 font-semibold',
        };
      default:
        return {
          label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
          icon: null,
          badge: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shadow-2xs',
        config.badge,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

