"use client";
import React from 'react';
import { useDashboardStore } from '@/lib/store';

export const PipelineStatusBar = () => {
  const { activePipeline } = useDashboardStore();
  if (!activePipeline) return null;

  const steps = [
    { key: 'intent_classified', label: 'Intent Analysis' },
    { key: 'columns_resolved', label: 'Schema Mapping' },
    { key: 'stats_computed', label: 'Statistical Engine' },
    { key: 'agent_running', label: 'Insight Generation' }
  ];

  return (
    <div className="mx-auto max-w-4xl p-6 mb-8 animate-reveal">
      <div className="card !p-4 border-accent-dim/30 bg-accent-dim/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent status-dot-active" />
            <span className="mono text-[10px] uppercase text-accent tracking-[0.1em]">Orchestrator Routing...</span>
          </div>
          <span className="mono text-[10px] text-tertiary">Query ID: {activePipeline.queryId.slice(0, 8)}</span>
        </div>

        <div className="flex gap-4">
          {steps.map((step, idx) => {
            const isDone = activePipeline.events.some(e => e.event === step.key);
            const isActive = !isDone && (idx === 0 || activePipeline.events.some(e => e.event === steps[idx-1].key));

            return (
              <div key={step.key} className="flex-1 flex flex-col gap-2">
                <div className={`h-1 rounded-full transition-colors duration-500 ${isDone ? 'bg-accent' : isActive ? 'bg-accent/30' : 'bg-bg-border'}`} />
                <span className={`text-[10px] mono uppercase truncate ${isDone || isActive ? 'text-accent-text' : 'text-tertiary'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
