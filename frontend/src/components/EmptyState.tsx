import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/Button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  className,
  icon,
  title,
  description,
  actionLabel,
  onAction,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl space-y-3',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="p-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-full">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-xs">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
