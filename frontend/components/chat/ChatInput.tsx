"use client";
import React, { useState } from 'react';

export const ChatInput = ({ onSend }: { onSend: (q: string) => void }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = () => {
    if (!question.trim()) return;
    onSend(question);
    setQuestion('');
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent pb-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        
        {/* Intent Shortcuts */}
        <div className="flex gap-2">
            {[
                { label: 'Compare', icon: '📊' },
                { label: 'Breakdown', icon: '📦' },
                { label: 'Summary', icon: '📅' },
                { label: 'Anomaly', icon: '⚠️' }
            ].map(intent => (
                <button 
                  key={intent.label}
                  onClick={() => setQuestion(prev => `${intent.label} ${prev}`)}
                  className="px-3 py-1.5 rounded-full border border-bg-border bg-bg-surface hover:border-accent/40 text-[11px] font-sans text-text-secondary hover:text-text-primary transition-all flex items-center gap-2"
                >
                  <span>{intent.icon}</span>
                  {intent.label}
                </button>
            ))}
        </div>

        <div className="relative group">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask anything about your data... e.g. 'Why did revenue drop last month?'"
            className="w-full bg-bg-surface border border-bg-border rounded-xl px-4 py-4 pr-24 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent-dim/10 resize-none min-h-[56px] transition-all"
            rows={1}
          />
          
          <button 
            onClick={handleSubmit}
            className="absolute right-2.5 top-2.5 px-4 h-9 rounded-lg bg-accent text-bg-base text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>↵</span>
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};
