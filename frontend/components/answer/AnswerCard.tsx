"use client";
import React from 'react';
import { QueryResult } from '@/lib/types';
import { NumberTicker } from '../ui/NumberTicker';
import { ChartModule } from './ChartModule';

export const AnswerCard = ({ result }: { result: QueryResult }) => {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-sm mb-8 reveal group hover:border-accent/30 transition-all duration-500 overflow-hidden">
      {/* Precision Header */}
      <div className="px-6 py-3 border-b border-bg-border flex items-center justify-between bg-bg-elevated/20">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="mono text-[9px] uppercase tracking-[0.2em] text-accent font-bold">
            {result.intent} Dispatch
          </span>
        </div>
        <span className="mono text-[9px] uppercase text-text-tertiary">
          Trace: {result._id?.toString().slice(-8) || 'LOCAL_01'}
        </span>
      </div>

      <div className="p-8">
        {/* Editorial Headline */}
        <h2 className="text-3xl font-normal italic text-text-primary mb-8 leading-tight max-w-3xl">
          {result.headline}
        </h2>
        
        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-bg-border border border-bg-border rounded-sm overflow-hidden mb-10">
          <div className="bg-bg-base p-6">
            <span className="mono text-[9px] uppercase text-text-tertiary block mb-2 tracking-widest">{result.metricName}</span>
            <div className="flex items-baseline gap-3">
              <NumberTicker value={result.metricValue} decimals={2} />
              <span className="text-sm text-text-tertiary italic">Primary</span>
            </div>
          </div>
          
          <div className="bg-bg-base p-6 flex flex-col justify-end">
            <span className="mono text-[9px] uppercase text-text-tertiary block mb-2 tracking-widest">Statistical Variance</span>
            <div className={`flex items-center gap-2 font-bold ${result.changeDirection === 'up' ? 'text-green' : 'text-red'}`}>
              <span className="text-lg mono">{result.changeDirection === 'up' ? '↑' : '↓'} {Math.abs(result.changeValue)}%</span>
              <div className={`text-[10px] px-2 py-0.5 rounded-full border ${result.changeDirection === 'up' ? 'bg-green/10 border-green/20' : 'bg-red/10 border-red/20'}`}>
                Relative to Baseline
              </div>
            </div>
          </div>
        </div>

        {/* Insight Breakdown */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1">
             <div className="mono text-[9px] uppercase text-text-tertiary mb-6 flex items-center gap-3">
              <span className="w-4 h-[1px] bg-bg-border" />
              Agent Interpretation
             </div>
             <p className="text-lg text-text-secondary leading-relaxed font-medium">
                {result.explanation}
             </p>
          </div>
          
          <div className="w-full lg:w-[450px] pt-4">
            <ChartModule 
                type={result.intent === 'BREAKDOWN' ? 'bar' : result.intent === 'COMPARE' ? 'comparison' : result.intent === 'ANOMALY' ? 'bar' : 'pie'} 
                data={result.chartData} 
            />
          </div>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="px-8 py-4 bg-bg-elevated/40 border-t border-bg-border flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <div className="w-24 h-1 bg-bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${result.confidence * 100}%` }} />
            </div>
            <span className="mono text-[8px] uppercase text-text-tertiary">Confidence Index: {Math.round(result.confidence * 100)}%</span>
          </div>
          <div className="h-4 w-[1px] bg-bg-border" />
          <span className="mono text-[9px] uppercase text-text-tertiary">{result.sourceSummary}</span>
        </div>
        <div className="mono text-[10px] text-text-tertiary">{result.durationMs}ms</div>
      </div>
    </div>
  );
};
