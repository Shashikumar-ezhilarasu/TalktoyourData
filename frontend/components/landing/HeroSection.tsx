import React from 'react';

export const HeroSection = () => {
  return (
    <div className="flex flex-col justify-center h-full px-12 lg:px-24">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-tertiary mb-6">
        NatWest · DataLens
      </div>
      
      <h1 className="display text-text-primary mb-8 leading-[1.05]">
        Ask your data <br />
        <span className="text-accent italic">anything.</span>
      </h1>
      
      <p className="body text-text-secondary text-lg max-w-md mb-12 leading-relaxed">
        Upload a CSV. Ask in plain English. Get 
        trustworthy answers in seconds. No code required.
      </p>
      
      <div className="flex gap-3">
        {['Clarity', 'Trust', 'Speed'].map(pillar => (
          <div key={pillar} className="px-3 py-1 border border-accent-dim rounded-full text-[10px] mono uppercase text-accent-text bg-accent-dim/20">
            {pillar}
          </div>
        ))}
      </div>
    </div>
  );
};
