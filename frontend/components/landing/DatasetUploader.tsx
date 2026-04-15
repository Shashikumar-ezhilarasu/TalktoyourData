"use client";
import React, { useState, useCallback } from "react";
import { SignInButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowRight, Shield, Zap, FileText } from "lucide-react";

export const DatasetUploader = () => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <motion.div
        animate={{
          scale: isDragging ? 1.02 : 1,
          backgroundColor: isDragging ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0)",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`w-full p-8 aspect-[4/5] border border-bg-border rounded-xl flex flex-col items-center justify-center text-center transition-all duration-700 relative group overflow-hidden bg-bg-base/50 shadow-xl shadow-black/[0.02]`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-accent-main mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Upload size={20} />
            </div>

            <h3 className="text-xl font-medium text-text-primary mb-2">
              Initialize Analysis
            </h3>
            <p className="text-[11px] mono uppercase text-text-tertiary mb-10 tracking-widest font-bold">
              Drop your dataset to begin.
            </p>

            <SignInButton mode="modal">
              <button className="btn-editorial cursor-pointer flex items-center gap-2 group/btn mb-8">
                <span className="text-xs uppercase font-bold tracking-widest">
                  Attach Data
                </span>
                <ArrowRight
                  size={12}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </button>
            </SignInButton>

            <SignInButton mode="modal">
              <button className="text-[9px] mono uppercase text-text-tertiary hover:text-accent-main transition-colors flex items-center gap-1.5">
                <span>or utilize</span>
                <span className="font-bold underline underline-offset-4">
                  Sales Demo Dataset
                </span>
              </button>
            </SignInButton>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="mt-8 flex items-center gap-6 opacity-60">
        {[
          { icon: <Shield size={12} />, label: "Scrubbed" },
          { icon: <Zap size={12} />, label: "Fast" },
          { icon: <FileText size={12} />, label: "Auto" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 text-text-tertiary"
          >
            {item.icon}
            <span className="text-[8px] mono uppercase font-bold tracking-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
