"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Command, ArrowUp } from "lucide-react";

type QuickPrompt = {
  label: string;
  query: string;
  tone?: "neutral" | "alert";
};

export const ChatInput = ({
  onSend,
  quickPrompts,
}: {
  onSend: (q: string) => void;
  quickPrompts?: QuickPrompt[];
}) => {
  const [question, setQuestion] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const prompts: QuickPrompt[] =
    quickPrompts && quickPrompts.length > 0
      ? quickPrompts
      : [
          { label: "Compare", query: "Compare the top two groups" },
          { label: "Breakdown", query: "Break down the total by category" },
          {
            label: "Anomaly",
            query: "Find anomalies in the numeric values",
            tone: "alert",
          },
        ];

  const handleSubmit = () => {
    if (!question.trim()) return;
    onSend(question);
    setQuestion("");
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {/* Intent Shortcuts */}
        <div className="flex gap-2 justify-center flex-wrap">
          {prompts.map((intent, idx) => (
            <motion.button
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={intent.label}
              onClick={() => onSend(intent.query)}
              className={`px-4 py-1.5 rounded-full text-[10px] mono uppercase font-bold tracking-widest border hover:border-accent-main/30 transition-all shadow-sm ${
                intent.tone === "alert"
                  ? "bg-red-dim/70 text-red border-red/20"
                  : "bg-bg-elevated text-text-primary border-bg-border"
              }`}
            >
              {intent.label}
            </motion.button>
          ))}
        </div>

        <motion.div
          animate={{
            scale: isFocused ? 1.01 : 1,
            boxShadow: isFocused
              ? "0 20px 40px -10px rgba(0,0,0,0.12)"
              : "0 4px 12px -2px rgba(0,0,0,0.05)",
          }}
          className={`relative bg-bg-base border ${isFocused ? "border-accent-main" : "border-bg-border"} rounded-2xl p-2 transition-colors duration-500`}
        >
          <div className="flex items-end gap-2 px-3 pb-1">
            <div className="pt-3.5 pb-2">
              <Sparkles
                size={16}
                className={
                  isFocused ? "text-accent-main" : "text-text-tertiary"
                }
              />
            </div>

            <textarea
              value={question}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Examine your data clusters..."
              className="flex-1 bg-transparent py-3 text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none resize-none min-h-[48px] max-h-[200px]"
              rows={1}
            />

            <div className="pb-1.5 pr-1">
              <button
                onClick={handleSubmit}
                disabled={!question.trim()}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${question.trim() ? "bg-accent-main text-white scale-100 shadow-lg" : "bg-bg-elevated text-text-tertiary scale-90 opacity-50"}`}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-1.5 bg-bg-surface/50 border-t border-bg-border/30 rounded-b-2xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Command size={10} className="text-text-tertiary" />
                <span className="text-[9px] mono uppercase text-text-tertiary font-bold tracking-tighter">
                  Enter to send
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-bg-border" />
              <span className="text-[9px] mono uppercase text-text-tertiary font-bold tracking-tighter italic">
                Hybrid IQ Active
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-main animate-pulse" />
              <span className="text-[8px] mono uppercase font-black text-accent-main">
                Live
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
