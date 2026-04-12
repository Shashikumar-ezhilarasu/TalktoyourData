"use client";
import React from "react";
import { QueryResult } from "@/lib/types";
import { NumberTicker } from "../ui/NumberTicker";
import { ChartModule } from "./ChartModule";
import { motion } from "framer-motion";
import { ShieldCheck, Info, Share2, CornerDownRight } from "lucide-react";

export const AnswerCard = ({ result }: { result: QueryResult }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-bg-base border border-bg-border rounded-lg mb-10 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-700"
    >
      {/* Precision Header */}
      <div className="px-8 py-4 border-b border-bg-border flex items-center justify-between bg-bg-surface/50">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-accent-main text-white">
            <ShieldCheck size={12} />
            <span className="mono text-[9px] uppercase tracking-[0.2em] font-bold">
              {result.intent}
            </span>
          </div>
          <div className="h-4 w-[1px] bg-bg-border" />
          <span className="mono text-[9px] uppercase tracking-widest text-text-tertiary">
            ID: {result._id?.toString().slice(-8) || "LOCAL_01"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-text-tertiary hover:text-accent-main transition-colors">
            <Share2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-10">
        {/* Editorial Headline */}
        <h2 className="text-4xl font-normal italic text-text-primary mb-10 leading-tight tracking-tight">
          {result.headline}
        </h2>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bg-border border border-bg-border rounded-sm overflow-hidden mb-12 shadow-sm">
          <div className="bg-bg-base p-8 group">
            <span className="mono text-[9px] uppercase text-text-tertiary block mb-3 tracking-[0.2em] group-hover:text-accent-main transition-colors">
              {result.metricName}
            </span>
            <div className="flex items-baseline gap-4">
              <NumberTicker value={result.metricValue} decimals={2} />
              <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            </div>
          </div>

          <div className="bg-bg-base p-8">
            <span className="mono text-[9px] uppercase text-text-tertiary block mb-3 tracking-[0.2em]">
              Contextual Variance
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl font-light italic ${result.changeDirection === "up" ? "text-zinc-900" : "text-zinc-500"}`}
              >
                {result.changeDirection === "up" ? "+" : "-"}
                {Math.abs(result.changeValue)}%
              </span>
              <div className="text-[9px] mono uppercase px-2 py-0.5 border border-bg-border text-text-tertiary rounded-sm">
                vs Baseline
              </div>
            </div>
          </div>

          <div className="bg-bg-base p-8 flex flex-col justify-center">
            <span className="mono text-[9px] uppercase text-text-tertiary block mb-3 tracking-[0.2em]">
              Process latency
            </span>
            <span className="text-xl font-light mono text-text-secondary">
              {result.durationMs}ms
            </span>
          </div>
        </div>

        {/* Insight Breakdown */}
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-3 text-text-tertiary italic">
              <CornerDownRight size={16} strokeWidth={1.5} />
              <span className="text-sm font-medium">
                Analytical Interpretation
              </span>
            </div>

            <p className="text-xl text-text-secondary leading-relaxed font-normal">
              {result.explanation}
            </p>

            <div className="pt-6 border-t border-bg-border flex items-center gap-3 text-text-tertiary">
              <Info size={14} />
              <span className="text-[10px] mono uppercase tracking-wider">
                {result.sourceSummary}
              </span>
            </div>
          </div>

          <div className="w-full lg:w-[480px]">
            <div className="p-4 bg-bg-surface border border-bg-border rounded-lg">
              <ChartModule
                type={
                  result.intent === "BREAKDOWN"
                    ? "bar"
                    : result.intent === "COMPARE"
                      ? "comparison"
                      : result.intent === "ANOMALY"
                        ? "bar"
                        : "pie"
                }
                data={result.chartData}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="px-10 py-5 bg-bg-elevated/30 border-t border-bg-border flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="w-40 h-1 bg-bg-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence * 100}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-accent-main"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="mono text-[8px] uppercase font-bold text-text-tertiary">
                Precision Index
              </span>
              <span className="mono text-[8px] uppercase font-bold text-accent-main">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] mono text-text-tertiary uppercase">
            Local Intelligence Active
          </span>
          <div className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_rgba(0,230,118,0.4)]" />
        </div>
      </div>
    </motion.div>
  );
};
