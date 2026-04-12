"use client";
import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <div className="flex flex-col justify-center h-full px-12 lg:px-24">
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="mono text-[10px] uppercase tracking-[0.5em] text-text-tertiary mb-10 flex items-center gap-6"
      >
        <div className="w-12 h-[1px] bg-bg-border" />
        DataLens Intelligent Partner
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[80px] lg:text-[110px] text-text-primary mb-12 leading-[0.85] font-normal tracking-tighter italic"
      >
        Interrogate <br />
        <span className="text-accent-main not-italic font-bold">Your Assets.</span>
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl text-text-secondary max-w-xl mb-20 leading-snug font-light italic"
      >
        A hierarchical multi-agent platform designed for high-frequency data auditing. 
        Zero latency. Deterministic insights.
      </motion.p>
      
      <div className="flex gap-16">
        {[
          { label: 'Ingestion Engine', value: '100% Offline' },
          { label: 'Intelligence', value: 'Hybrid Native' },
          { label: 'Latency Index', value: 'Sub-15ms' }
        ].map((item, i) => (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + (i * 0.1) }}
            key={item.label} 
            className="flex flex-col gap-3"
          >
            <span className="mono text-[10px] uppercase text-text-tertiary font-bold tracking-[0.1em]">{item.label}</span>
            <div className="h-0.5 w-6 bg-accent-main/10 rounded-full" />
            <span className="mono text-[11px] text-text-primary font-bold">{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
