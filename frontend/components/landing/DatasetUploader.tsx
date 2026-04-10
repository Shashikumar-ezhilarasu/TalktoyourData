"use client";
import React, { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export const DatasetUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    // Validation
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      setError('Only .csv and .json files are supported');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB');
      return;
    }

    try {
      setStatus('uploading');
      const { datasetId } = await api.datasets.upload(file);
      router.push(`/dashboard/${datasetId}`);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setStatus('idle');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-12">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          w-full max-w-md aspect-square rounded-2xl border-2 border-dashed 
          transition-all duration-300 flex flex-col items-center justify-center p-12 text-center
          ${isDragging 
            ? 'border-accent bg-accent-dim/10' 
            : 'border-bg-border bg-bg-surface hover:border-text-tertiary'}
        `}
      >
        {status === 'idle' ? (
          <>
            <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </div>
            <h3 className="heading-2 mb-2">Drop your CSV here</h3>
            <p className="caption mb-8">Up to 50MB. We'll handle the rest.</p>
            
            <label className="btn-primary cursor-pointer mb-6">
              Browse files
              <input type="file" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                    // Trigger upload logic similar to onDrop
                }
              }} />
            </label>
            
            <div className="flex items-center w-full gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-bg-border" />
              <span className="text-[10px] mono text-tertiary uppercase">or</span>
              <div className="h-[1px] flex-1 bg-bg-border" />
            </div>
            
            <button className="btn-ghost">Try sample dataset →</button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-1 w-48 bg-bg-elevated rounded-full overflow-hidden mb-8">
                <div className="h-full bg-accent animate-[shimmer_2s_infinite]" style={{ width: '60%' }} />
            </div>
            <h3 className="heading-3 mono text-accent">Parsing Rows...</h3>
            <p className="caption mt-2">Initializing multi-agent pipeline</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-red-dim border border-red/20 text-red text-xs mono">
          {error}
        </div>
      )}
    </div>
  );
};
