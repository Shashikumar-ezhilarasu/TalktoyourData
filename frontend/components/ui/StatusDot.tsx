import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const StatusDot = ({ status }: { status: 'ready' | 'processing' | 'error' }) => {
  const colors = {
    ready: 'bg-green-500',
    processing: 'bg-amber-500 status-dot-active',
    error: 'bg-red-500'
  };

  return (
    <div className={cn("w-2 h-2 rounded-full", colors[status])} />
  );
};

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("skeleton h-4 w-full rounded", className)} />
  );
};
