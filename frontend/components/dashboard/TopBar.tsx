"use client";
import React from 'react';
import { useDashboardStore } from '@/lib/store';
import { StatusDot } from '../ui/StatusDot';
import Link from 'next/link';

export const TopBar = () => {
  const { dataset } = useDashboardStore();

  return (
    <header className="h-[52px] border-b border-bg-border bg-bg-base/85 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-sans font-medium text-sm flex items-center gap-2">
          <span className="text-text-secondary">Data</span>
          <span className="text-accent">Lens</span>
        </Link>
        
        {dataset && (
          <div className="flex items-center gap-3 text-xs mono">
            <span className="text-text-primary">{dataset.filename}</span>
            <span className="text-tertiary">·</span>
            <span className="text-text-secondary">{dataset.rowCount.toLocaleString()} rows</span>
            <span className="text-tertiary">·</span>
            <span className="text-text-secondary">{dataset.columnCount} columns</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <StatusDot status={dataset?.processingStatus || 'processing'} />
          <span className="text-[10px] mono uppercase tracking-wider text-text-secondary">
            {dataset?.processingStatus || 'Initializing'}
          </span>
        </div>
        
        <Link href="/" className="btn-ghost !py-1 !px-3 text-[11px] uppercase mono">
          New Dataset
        </Link>
      </div>
    </header>
  );
};
