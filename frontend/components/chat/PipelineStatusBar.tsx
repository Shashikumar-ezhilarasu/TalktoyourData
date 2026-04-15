"use client";
import React from "react";
import { useDashboardStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Search, BrainCircuit, Sparkles, Loader2 } from "lucide-react";

export const PipelineStatusBar = () => {
  const { activePipeline } = useDashboardStore();
  const isDarkTheme =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  if (!activePipeline) return null;
  if (isDarkTheme) return null;

  const steps = [
    {
      key: "RESOLVING_SCHEMA",
      label: "Semantic Mapping",
      icon: <Search size={14} />,
    },
    {
      key: "CLASSIFYING_INTENT",
      label: "Intent Analysis",
      icon: <BrainCircuit size={14} />,
    },
    {
      key: "AGENT_EXECUTION",
      label: "Reasoning Engine",
      icon: <Cpu size={14} />,
    },
    {
      key: "COMPILING_INSIGHT",
      label: "Insight Generation",
      icon: <Sparkles size={14} />,
    },
  ];

  const latestUpdate = [...activePipeline.events]
    .reverse()
    .find((e) => e.event === "pipeline_update");
  const currentMessage =
    latestUpdate?.data?.message || "Handshaking with Data Stream...";
  const currentStage = latestUpdate?.data?.stage || "INITIALIZING";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="mx-auto max-w-5xl p-6 mb-10"
      >
        <div className="bg-bg-base border border-bg-border rounded-lg p-8 shadow-[0_10px_40px_-15px_rgba(2,8,23,0.16)] relative overflow-hidden">
          {/* Active Shimmer */}
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-main/20 to-transparent"
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-accent-main relative">
                <Loader2
                  size={24}
                  className="animate-spin opacity-20 absolute"
                />
                <Cpu size={20} className="relative z-10" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] mono uppercase tracking-widest text-text-tertiary block">
                  Processing Operation: {activePipeline.queryId.slice(0, 8)}
                </span>
                <h3 className="text-xl font-medium tracking-tight text-text-primary italic">
                  {currentMessage}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-bg-elevated border border-bg-border rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              <span className="text-[10px] mono uppercase font-bold tracking-tight text-text-primary">
                Active Trace
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const currentStepIdx = steps.findIndex(
                (s) => s.key === currentStage,
              );
              const targetStepIdx = steps.findIndex((s) => s.key === step.key);

              const isCompleted =
                targetStepIdx < currentStepIdx ||
                activePipeline.events.some((e) => e.event === step.key);
              const isActive = currentStage === step.key;

              return (
                <div key={step.key} className="space-y-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className={`p-1.5 rounded-sm transition-colors duration-500 ${isCompleted ? "bg-accent-main text-white" : isActive ? "bg-accent-soft text-accent-main" : "bg-bg-elevated text-text-tertiary"}`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-[10px] mono uppercase font-bold tracking-wider ${isCompleted || isActive ? "text-accent-main" : "text-text-tertiary"}`}
                    >
                      {step.label}
                    </span>
                  </div>

                  <div className="h-1 bg-bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: isCompleted ? "100%" : isActive ? "60%" : "0%",
                      }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className={`h-full ${isCompleted ? "bg-accent-main" : "bg-bg-border"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
