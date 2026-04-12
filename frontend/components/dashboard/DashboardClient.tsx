"use client";
import React, { useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ChatInput } from '@/components/chat/ChatInput';
import { PipelineStatusBar } from '@/components/chat/PipelineStatusBar';
import { AnswerCard } from '@/components/answer/AnswerCard';
import { useDashboardStore } from '@/lib/store';
import { api } from '@/lib/api';
import { DatasetMeta } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, LayoutGrid, Clock, ChevronRight, Zap } from 'lucide-react';

export default function DashboardClient({ datasetId, initialDataset }: { datasetId: string, initialDataset: DatasetMeta }) {
  const { 
    setDataset, 
    queries, 
    addQuery, 
    startPipeline, 
    addPipelineEvent,
    dataset 
  } = useDashboardStore();

  useEffect(() => {
    setDataset(initialDataset);
  }, [initialDataset, setDataset]);

  const handleQuery = async (question: string) => {
    try {
      const response = await api.query.submit(datasetId, question) as any;
      const { queryId } = response;
      startPipeline(queryId);

      const host = window.location.hostname;
      const streamUrl = `http://${host}:4000/api/stream/${queryId}`;
      const eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        addPipelineEvent(data);
        if (data.event === 'insight_ready') {
          addQuery(data.data);
          eventSource.close();
        }
        if (data.event === 'error') {
          console.error('Pipeline error:', data.data);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
      
    } catch (err) {
      console.error('Query submission failed', err);
    }
  };

  return (
    <DashboardShell 
      sidebar={
        <div className="flex flex-col h-full py-8">
            <div className="px-6 mb-10">
                <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-accent-main text-white shadow-sm mb-6">
                    <LayoutGrid size={14} />
                    <span className="text-[11px] mono uppercase font-bold tracking-widest">Dashboard</span>
                </div>
                
                <div className="space-y-1">
                    <div className="px-3 py-2 flex items-center justify-between group cursor-pointer hover:bg-bg-elevated rounded-md transition-all">
                        <div className="flex items-center gap-3">
                            <Clock size={14} className="text-text-tertiary" />
                            <span className="text-xs font-medium text-text-secondary">History</span>
                        </div>
                        <span className="text-[10px] mono text-text-tertiary bg-bg-border px-1.5 py-0.5 rounded-sm">{queries.length}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
                <div className="mono text-[9px] uppercase text-text-tertiary mb-4 tracking-[0.2em] px-3 font-bold">Recent Insights</div>
                <div className="space-y-2">
                    {queries.map((q, idx) => (
                        <motion.button 
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={q._id} 
                            className="w-full text-left p-4 rounded-lg bg-white border border-bg-border hover:border-black transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-main" />
                                <span className="mono text-[8px] uppercase font-bold tracking-widest text-text-tertiary">{q.intent}</span>
                            </div>
                            <div className="text-[11px] font-medium text-text-primary leading-snug line-clamp-2">{q.headline}</div>
                        </motion.button>
                    ))}
                    {queries.length === 0 && (
                        <div className="p-8 text-center border-2 border-dashed border-bg-border rounded-xl">
                            <MessageSquare className="mx-auto mb-3 text-bg-border" size={20} />
                            <span className="text-[10px] mono uppercase text-text-tertiary block">Standby</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      }
    >
      <div className="h-full w-full overflow-y-auto bg-bg-surface relative py-10">
        {/* Background Dot Grid */}
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-40" />

        <div className="max-w-5xl mx-auto px-6 lg:px-10 pb-48 relative z-10">
            {queries.length === 0 && (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="relative w-32 h-32 mb-12">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-[0.5px] border-text-primary/20 rounded-full"
                        />
                         <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-4 border-[0.5px] border-text-primary/10 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap size={32} className="text-text-primary opacity-30" />
                        </div>
                    </div>
                    
                    <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-text-tertiary mb-4 font-bold block">
                        Dataset Vectorized & Ready
                    </span>
                    <div className="flex gap-6 mb-10 text-sm font-medium text-text-secondary bg-bg-elevated px-6 py-3 rounded-full border border-bg-border">
                        <div className="flex items-center gap-2"><span className="text-text-primary font-bold">{dataset?.rowCount?.toLocaleString() || 0}</span> Rows</div>
                        <div className="w-[1px] h-4 bg-bg-border" />
                        <div className="flex items-center gap-2"><span className="text-text-primary font-bold">{dataset?.columnCount?.toLocaleString() || 0}</span> Columns</div>
                        <div className="w-[1px] h-4 bg-bg-border" />
                        <div className="flex items-center gap-2"><span className="text-text-primary font-bold">{(dataset?.rowCount || 0) * (dataset?.columnCount || 0)}</span> Data Points</div>
                    </div>

                    <h2 className="text-5xl font-normal italic tracking-tight text-text-primary mb-8 max-w-2xl leading-[1.1]">
                        What shall we explore in your data today?
                    </h2>
                    <div className="flex gap-4">
                        <button className="btn-editorial">Recent Trends</button>
                        <button className="btn-ghost">Anomalies</button>
                    </div>
                </motion.div>
            )}

            <PipelineStatusBar />
            
            <div className="flex flex-col">
                <AnimatePresence mode="popLayout">
                    {queries.map((q) => (
                        <AnswerCard key={q._id} result={q} />
                    ))}
                </AnimatePresence>
            </div>
        </div>

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
           <ChatInput onSend={handleQuery} />
        </div>
      </div>
    </DashboardShell>
  );
}
