import React from 'react';

export const HeroSection = () => {
  return (
    <div className="flex flex-col justify-center h-full px-12 lg:px-32 max-w-5xl">
      <div className="mono text-[10px] uppercase tracking-[0.4em] text-accent mb-8 flex items-center gap-4">
        <span className="w-8 h-[1px] bg-accent" />
        NatWest · Intelligence Engine
      </div>
      
      <h1 className="text-[72px] lg:text-[100px] text-text-primary mb-12 leading-[0.9] font-normal italic">
        Talk to your <br />
        <span className="text-accent underline decoration-1 underline-offset-[12px]">Data.</span>
      </h1>
      
      <p className="text-xl text-text-secondary max-w-lg mb-16 leading-relaxed font-medium">
        Deploy a hierarchical multi-agent system to interrogate your datasets. Zero code. Instant statistical certainty.
      </p>
      
      <div className="flex gap-12">
        {[
          { label: 'Ingestion', value: 'PII-Cleaned' },
          { label: 'Agents', value: 'Hierarchical' },
          { label: 'Trust', value: 'Pure Math' }
        ].map(item => (
          <div key={item.label} className="flex flex-col gap-2">
            <span className="mono text-[9px] uppercase text-text-tertiary">{item.label}</span>
            <span className="mono text-xs text-text-primary">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
