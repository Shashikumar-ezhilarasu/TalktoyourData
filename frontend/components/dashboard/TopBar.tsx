"use client";
import React from 'react';
import { useDashboardStore } from '@/lib/store';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogOut, Database, Layers, Activity } from 'lucide-react';

export const TopBar = () => {
  const { dataset } = useDashboardStore();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-[60px] border-b border-bg-border bg-white/70 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50"
    >
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-6 h-6 bg-accent-main rounded-sm flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform duration-500">
             <span className="text-white text-[10px] -rotate-45 group-hover:-rotate-90 transition-transform duration-500">✦</span>
          </div>
          <span className="font-bold text-[11px] uppercase tracking-[0.4em] text-text-primary">DataLens</span>
        </Link>
        
        {dataset && (
          <div className="hidden md:flex items-center gap-8">
            <div className="h-4 w-[1px] bg-bg-border" />
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Database size={11} className="text-text-tertiary" />
                <span className="mono text-[9px] uppercase tracking-widest text-text-secondary">{dataset.filename}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Layers size={11} className="text-text-tertiary" />
                <span className="mono text-[9px] uppercase tracking-widest text-text-secondary">
                  {dataset.rowCount?.toLocaleString() || '---'} <span className="text-text-tertiary">Entries</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {dataset && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-bg-elevated border border-bg-border shadow-sm"
            >
              <Activity size={10} className="text-text-primary animate-pulse" />
              <span className="text-[9px] mono uppercase font-bold tracking-tight text-text-primary">
                {dataset.processingStatus === 'ready' ? 'Analytical Engine: Live' : 'Processing Stream'}
              </span>
            </motion.div>
        )}
        
        <Link href="/" className="btn-ghost flex items-center gap-2 !px-3 !py-1.5">
          <LogOut size={12} />
          <span>Exit</span>
        </Link>
      </div>
    </motion.header>
  );
};
