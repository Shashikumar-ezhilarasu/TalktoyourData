"use client";
import React from 'react';
import { useDashboardStore } from '@/lib/store';
import { StatusDot } from '../ui/StatusDot';
import Link from 'next/link';

export const TopBar = () => {
  const { dataset } = useDashboardStore();

  return (
    <header className="h-[52px] border-b border-bg-border bg-bg-base/60 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-accent text-lg">✦</span>
          <span className="font-bold text-xs uppercase tracking-[0.3em] text-text-primary group-hover:text-accent transition-colors">DataLens</span>
        </Link>
        
        {dataset && (
          <div className="flex items-center gap-6">
            <div className="h-3 w-[1px] bg-bg-border" />
            <div className="flex items-center gap-4 mono text-[9px] uppercase tracking-widest text-text-tertiary">
              <span className="text-text-secondary">{dataset.filename}</span>
              <span>·</span>
              <span>{dataset.rowCount?.toLocaleString() || '---'} ROWS</span>
              <span>·</span>
              <span>{dataset.columnCount || '---'} COLS</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-bg-elevated/50 border border-bg-border">
          <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
          <span className="text-[9px] mono uppercase tracking-tighter text-text-secondary italic">
            Engine: {dataset?.processingStatus || 'Standby'}
          </span>
        </div>
        
        <Link href="/" className="btn-terminal">
          Disconnect
        </Link>
      </div>
    </header>
  );
};
