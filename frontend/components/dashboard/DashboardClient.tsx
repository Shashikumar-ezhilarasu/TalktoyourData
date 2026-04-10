"use client";
import React, { useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ChatInput } from '@/components/chat/ChatInput';
import { PipelineStatusBar } from '@/components/chat/PipelineStatusBar';
import { AnswerCard } from '@/components/answer/AnswerCard';
import { useDashboardStore } from '@/lib/store';
import { api } from '@/lib/api';
import { DatasetMeta } from '@/lib/types';

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
      // 1. Submit query and get ID
      const response = await api.query.submit(datasetId, question) as any;
      const { queryId } = response;
      
      startPipeline(queryId);

      // 2. Connect to real SSE stream
      const host = window.location.hostname;
      const streamUrl = `http://${host}:4000/api/stream/${queryId}`;
      const eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        addPipelineEvent(data);
        
        // If insight is ready, add to queries and close stream
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
        console.error('SSE Connection failed');
        eventSource.close();
      };
      
    } catch (err) {
      console.error('Query submission failed', err);
    }
  };

  return (
    <DashboardShell 
      sidebar={
        <nav className="p-4 flex flex-col gap-8">
            <section>
                <div className="mono text-[10px] uppercase text-tertiary mb-4 tracking-widest">Queries</div>
                <div className="flex flex-col gap-2">
                    {queries.length === 0 ? (
                        <div className="caption italic">No analysis history</div>
                    ) : (
                        queries.map(q => (
                            <button key={q._id} className="text-left p-3 rounded-lg border border-bg-border bg-bg-surface hover:border-accent/30 transition-all">
                                <div className={`badge badge-${q.intent.toLowerCase()} mb-2`}>{q.intent}</div>
                                <div className="text-[11px] text-text-primary truncate">{q.headline}</div>
                            </button>
                        ))
                    )}
                </div>
            </section>
        </nav>
      }
    >
      <div className="flex-1 overflow-y-auto pb-[180px] p-8">
        <div className="max-w-4xl mx-auto">
            {queries.length === 0 && !queries.length && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-24 h-24 mb-12 opacity-10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="6" />
                            <circle cx="12" cy="12" r="2" />
                        </svg>
                    </div>
                    <h2 className="heading-1 italic text-text-primary mb-2">Your data is ready.</h2>
                    <p className="body text-text-secondary">Ask a question to get started with your analysis.</p>
                </div>
            )}

            <PipelineStatusBar />
            
            <div className="flex flex-col gap-8">
                {queries.map((q) => (
                    <AnswerCard key={q._id} result={q} />
                ))}
            </div>
        </div>
      </div>

      <ChatInput onSend={handleQuery} />
    </DashboardShell>
  );
}
