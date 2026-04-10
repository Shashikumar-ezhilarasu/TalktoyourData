"use client";
import React, { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export const DatasetUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
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
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-12 relative">
      {/* Background Accent */}
      <div className="absolute inset-0 dot-matrix opacity-[0.03] pointer-events-none" />
      
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          w-full max-w-lg aspect-square rounded-lg border transition-all duration-500 flex flex-col items-center justify-center p-16 text-center reveal
          ${isDragging 
            ? 'border-accent bg-accent/5 shadow-[0_0_40px_rgba(245,166,35,0.1)]' 
            : 'border-bg-border bg-bg-surface/50 hover:border-text-tertiary'}
        `}
      >
        {status === 'idle' ? (
          <>
            <div className="w-10 h-10 border border-bg-border bg-bg-elevated flex items-center justify-center mb-10 rotate-45 transform hover:rotate-180 transition-transform duration-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="-rotate-45">
                <path d="M12 2v20M5 9l7-7 7 7"/>
              </svg>
            </div>
            
            <h3 className="text-xl font-medium text-text-primary mb-3">Initialize Analysis</h3>
            <p className="mono text-[11px] text-text-tertiary uppercase tracking-wider mb-12">Drag CSV or JSON to Begin</p>
            
            <label className="btn-accent cursor-pointer mb-8">
              Select Dataset
              <input type="file" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }} />
            </label>
            
            <div className="mono text-[9px] text-text-tertiary uppercase flex items-center gap-4 mb-8">
              <div className="w-8 h-[1px] bg-bg-border" />
              Secure Pipeline Active
              <div className="w-8 h-[1px] bg-bg-border" />
            </div>

            <button 
              onClick={async () => {
                setStatus('uploading');
                try {
                  const res = await fetch('http://localhost:4000/api/datasets/sample');
                  const { datasetId } = await res.json();
                  router.push(`/dashboard/${datasetId}`);
                } catch (e) {
                  setError('Failed to load sample');
                  setStatus('idle');
                }
              }}
              className="mono text-[10px] text-text-tertiary hover:text-accent uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <span>or</span> 
              <span className="underline decoration-1 underline-offset-4">Try Sample Dataset</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center w-full max-w-xs">
            <div className="mono text-[10px] text-accent uppercase tracking-widest mb-6">Pipeline Executing</div>
            <div className="w-full h-1 bg-bg-border rounded-full overflow-hidden mb-4">
                <div className="h-full bg-accent animate-[shimmer_2s_infinite]" style={{ width: '45%' }} />
            </div>
            <div className="mono text-[10px] text-text-tertiary uppercase">Parsing 1,402 rows...</div>
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
