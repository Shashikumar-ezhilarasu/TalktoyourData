"use client";
import React from 'react';
import { useDashboardStore } from '@/lib/store';

export const PipelineStatusBar = () => {
  const { activePipeline } = useDashboardStore();
  if (!activePipeline) return null;

  const steps = [
    { key: 'RESOLVING_SCHEMA', label: 'Semantic Mapping' },
    { key: 'CLASSIFYING_INTENT', label: 'Intent Analysis' },
    { key: 'AGENT_EXECUTION', label: 'Reasoning Engine' },
    { key: 'COMPILING_INSIGHT', label: 'Insight Generation' }
  ];

  const latestUpdate = [...activePipeline.events].reverse().find(e => e.event === 'pipeline_update');
  const currentMessage = latestUpdate?.data?.message || 'Orchestrator Routing...';

  return (
    <div className="mx-auto max-w-4xl p-6 mb-8 animate-reveal">
      <div className="card !p-4 border-accent-dim/30 bg-accent-dim/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent status-dot-active" />
            <span className="mono text-[10px] uppercase text-accent tracking-[0.1em] font-bold animate-pulse">{currentMessage}</span>
          </div>
          <span className="mono text-[10px] text-tertiary">Query ID: {activePipeline.queryId.slice(0, 8)}</span>
        </div>

        <div className="flex gap-4">
          {steps.map((step, idx) => {
            const isDone = activePipeline.events.some(e => 
              e.event === step.key || (e.event === 'pipeline_update' && e.data.stage === step.key)
            ) || (idx < steps.findIndex(s => activePipeline.events.some(e => e.data?.stage === s.key || e.event === s.key)));
            
            // Smarter isDone: if any future step is done, current is done
            const currentStepIdx = steps.findIndex(s => s.key === step.key);
            const anyFutureStepStarted = activePipeline.events.some(e => {
                const stage = e.data?.stage || e.event;
                const stageIdx = steps.findIndex(s => s.key === stage);
                return stageIdx > currentStepIdx;
            });

            const completed = isDone || anyFutureStepStarted;
            const active = !completed && (idx === 0 || anyFutureStepStarted || activePipeline.events.some(e => {
                 const stage = e.data?.stage || e.event;
                 const stageIdx = steps.findIndex(s => s.key === stage);
                 return stageIdx === currentStepIdx - 1;
            }));

            return (
              <div key={step.key} className="flex-1 flex flex-col gap-2">
                <div className={`h-1 rounded-full transition-all duration-700 ${completed ? 'bg-accent' : active ? 'bg-accent/30 shadow-[0_0_10px_rgba(245,166,35,0.2)]' : 'bg-bg-border'}`} />
                <span className={`text-[9px] mono uppercase truncate ${completed || active ? 'text-accent' : 'text-tertiary'}`}>
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
