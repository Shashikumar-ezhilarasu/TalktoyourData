"use client";
import React from 'react';
import { QueryResult } from '@/lib/types';
import { NumberTicker } from '../ui/NumberTicker';
import { BreakdownBarChart } from '../charts/BreakdownBarChart';

export const AnswerCard = ({ result }: { result: QueryResult }) => {
  return (
    <div className="card animate-reveal mb-8 p-0 overflow-hidden flex flex-col group">
      {/* Intent Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-bg-border group-hover:bg-bg-elevated/20 transition-colors">
        <div className="flex items-center gap-3">
          <span className={`badge badge-${result.intent.toLowerCase()}`}>
            {result.intent}
          </span>
          <span className="text-[10px] mono text-tertiary">
            {new Date(result.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <button className="text-tertiary hover:text-accent transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>

      <div className="p-6">
        {/* Headline & Metric */}
        <div className="mb-8">
            <h2 className="heading-1 mb-6 text-text-primary leading-tight max-w-2xl">
                {result.headline}
            </h2>
            
            <div className="card !bg-bg-base/30 !p-6 border-bg-border/50 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="mono text-[10px] uppercase text-text-secondary tracking-widest">{result.metricName}</span>
                    <NumberTicker value={result.metricValue} decimals={2} />
                </div>
                
                <div className="flex flex-col items-end gap-1">
                    <div className={`
                        px-2 py-0.5 rounded-md text-xs font-medium mono
                        ${result.changeDirection === 'up' ? 'bg-green-dim text-green' : 'bg-red-dim text-red'}
                    `}>
                        {result.changeDirection === 'up' ? '↑' : '↓'} {Math.abs(result.changeValue)}%
                    </div>
                    <span className="text-[10px] mono text-tertiary uppercase">vs previous period</span>
                </div>
            </div>
        </div>

        {/* Top Contributor if exists */}
        {result.topContributor && (
            <div className="mb-8 p-4 rounded-lg bg-accent-dim/10 border-l-2 border-accent flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-accent-dim flex items-center justify-center text-accent text-xs">
                    {result.changeDirection === 'up' ? '↑' : '↓'}
                </div>
                <div>
                    <h4 className="heading-3 text-accent-text">{result.topContributor.value} {result.topContributor.dimension}</h4>
                    <p className="caption">Biggest contributor to {result.changeDirection} with {result.topContributor.impact}% impact.</p>
                </div>
            </div>
        )}

        {/* Explanation */}
        <p className="body text-text-secondary leading-relaxed mb-8">
            {result.explanation}
        </p>

        {/* Charts */}
        <div className="mb-8">
            {result.intent === 'BREAKDOWN' && <BreakdownBarChart data={result.chartData} />}
            {/* Other chart types would follow here */}
        </div>

        {/* Follow Ups */}
        <div className="flex gap-2 flex-wrap">
            {result.suggestedFollowUps.map(q => (
                <button key={q} className="px-3 py-1.5 rounded-full border border-bg-border hover:border-accent/40 text-[11px] text-text-secondary hover:text-text-primary transition-all">
                    {q}
                </button>
            ))}
        </div>
      </div>

      {/* Source Footer */}
      <div className="px-6 py-4 bg-bg-elevated/30 border-t border-bg-border flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <span className="mono text-[10px] text-tertiary uppercase tracking-tighter">
                Computed from {result.sourceSummary}
            </span>
            <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${result.confidence * 100}%` }} />
                </div>
                <span className="mono text-[9px] text-tertiary uppercase">Confidence: {Math.round(result.confidence * 100)}%</span>
            </div>
        </div>
        <span className="mono text-[10px] text-tertiary uppercase">{result.durationMs}ms</span>
      </div>
    </div>
  );
};
