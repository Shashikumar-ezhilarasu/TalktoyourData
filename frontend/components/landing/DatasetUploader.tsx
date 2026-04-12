"use client";
import React, { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Shield, Zap, Loader2, ArrowRight } from 'lucide-react';

export const DatasetUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      setError('Only .csv and .json files are supported');
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
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <motion.div 
        animate={{ 
            scale: isDragging ? 1.02 : 1,
            backgroundColor: isDragging ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0)"
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`w-full max-w-lg p-12 aspect-[4/5] border border-bg-border rounded-xl flex flex-col items-center justify-center text-center transition-all duration-700 relative group overflow-hidden bg-white shadow-xl shadow-black/[0.02]`}
      >
        <AnimatePresence mode="wait">
        {status === 'idle' ? (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-accent-main mb-12 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Upload size={24} />
            </div>
            
            <h3 className="text-2xl font-medium text-text-primary mb-3">Initialize Analysis</h3>
            <p className="body text-text-tertiary mb-16 italic font-medium">Drop your dataset to begin interrogation.</p>
            
            <label className="btn-editorial cursor-pointer flex items-center gap-2 group/btn mb-10">
              <span>Attach Data</span>
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              <input type="file" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }} />
            </label>
            
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
              className="text-[10px] mono uppercase text-text-tertiary hover:text-accent-main transition-colors flex items-center gap-1.5"
            >
              <span>or utilize</span> 
              <span className="font-bold underline underline-offset-4">Sales Demo Dataset</span>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full px-8"
          >
            <Loader2 size={40} className="animate-spin text-accent-main mb-12 opacity-40" />
            <span className="text-[11px] mono uppercase font-bold text-accent-main tracking-widest mb-6 block">
                Executing Secure Pipeline
            </span>
            <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden mb-6">
                <motion.div 
                   initial={{ x: "-100%" }}
                   animate={{ x: "0%" }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="h-full bg-accent-main w-full" 
                />
            </div>
            <p className="text-xs text-text-tertiary italic">Cleansing and profiling data segments...</p>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-12 flex items-center gap-10">
         {[
           { icon: <Shield size={14} />, label: 'PII Scrubbing' },
           { icon: <Zap size={14} />, label: 'Hyper-Fast' },
           { icon: <FileText size={14} />, label: 'Auto-ID' }
         ].map(item => (
           <div key={item.label} className="flex items-center gap-3 text-text-tertiary">
              {item.icon}
              <span className="text-[9px] mono uppercase font-bold tracking-tight">{item.label}</span>
           </div>
         ))}
      </div>

      {error && (
        <motion.div 
           initial={{ y: 10, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="mt-10 px-6 py-4 bg-red-50 border border-red-100 rounded-lg"
        >
          <span className="text-[10px] mono text-red-600 font-bold uppercase">{error}</span>
        </motion.div>
      )}
    </div>
  );
};
