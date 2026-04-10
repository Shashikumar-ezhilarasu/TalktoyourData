"use client";
import React from 'react';
import { TopBar } from './TopBar';
import { useDashboardStore } from '@/lib/store';

export const DashboardShell = ({ children, sidebar }: { children: React.ReactNode, sidebar: React.ReactNode }) => {
  const { sidebarOpen } = useDashboardStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-base">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden relative">
        <aside 
          className={`
            border-r border-bg-border bg-bg-elevated/50 
            transition-all duration-200 ease-in-out
            overflow-y-auto overflow-x-hidden
            ${sidebarOpen ? 'w-[240px]' : 'w-0 opacity-0'}
          `}
        >
          {sidebar}
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
          {children}
        </main>
      </div>
    </div>
  );
};
