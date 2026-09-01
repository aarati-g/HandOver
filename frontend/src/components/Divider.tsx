import React from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({
  className,
  label,
  orientation = 'horizontal',
  ...props
}) => {
  if (orientation === 'vertical') {
    return <div className={cn('w-px h-full bg-slate-200 self-stretch', className)} {...props} />;
  }

  if (label) {
    return (
      <div className={cn('flex items-center my-4', className)} {...props}>
        <div className="grow border-t border-slate-200" />
        <span className="px-3 text-xs uppercase tracking-wider font-semibold text-slate-400">
          {label}
        </span>
        <div className="grow border-t border-slate-200" />
      </div>
    );
  }

  return <hr className={cn('border-t border-slate-200 my-4', className)} {...props} />;
};
