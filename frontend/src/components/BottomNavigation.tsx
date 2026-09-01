import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/assets', label: 'Assets', icon: Layers, end: false },
    { to: '/handover/new', label: 'New Handover', icon: PlusCircle, end: false },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-20 py-1 gap-1 text-[11px] font-medium transition-colors select-none',
                  isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-400 hover:text-slate-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform',
                      isActive && 'scale-110 stroke-[2.2]'
                    )}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
