"use client";
import React from 'react';
import { TopBar } from './TopBar';
import { useDashboardStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardShell = ({ children, sidebar }: { children: React.ReactNode, sidebar: React.ReactNode }) => {
  const { sidebarOpen } = useDashboardStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white selection:bg-black selection:text-white">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
            {sidebarOpen && (
                <motion.aside 
                    initial={{ x: -280, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -280, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-[300px] border-r border-bg-border bg-white z-40 h-full overflow-hidden"
                >
                    {sidebar}
                </motion.aside>
            )}
        </AnimatePresence>

        <main className="flex-1 relative overflow-hidden h-full bg-white">
          <div className="relative h-full w-full overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
