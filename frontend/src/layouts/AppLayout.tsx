import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Wifi } from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile-first responsive app container */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col shadow-xl border-x border-slate-200/80 relative">
        {/* Top Operational Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 select-none group">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-2xs group-hover:bg-blue-600 transition-colors">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 block leading-none">
                Handover
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block mt-0.5">
                AI Memory
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span>Online</span>
          </div>
        </header>

        {/* Page Content View with smooth subtle transition */}
        <main className="flex-1 p-4 pb-24 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
};
