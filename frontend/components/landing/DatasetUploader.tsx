"use client";
import React, { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  ArrowRight,
  Loader2,
  Shield,
  Zap,
  FileText
} from "lucide-react";

export const DatasetUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      setError("Only .csv and .json files are supported");
      return;
    }
    try {
      setStatus("uploading");
      const { datasetId } = await api.datasets.upload(file);
      router.push(`/dashboard/${datasetId}`);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setStatus("idle");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
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
          {status === "idle" ? (
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

              <label className="btn-editorial cursor-pointer flex items-center gap-2 group/btn mb-8">
                <span className="text-xs uppercase font-bold tracking-widest">Attach Data</span>
                <ArrowRight
                  size={12}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>

              <button
                onClick={async () => {
                  setStatus("uploading");
                  try {
                    const res = await fetch("http://localhost:4000/api/datasets/sample");
                    if (!res.ok) throw new Error("Failed to load sample");
                    const { datasetId } = await res.json();
                    router.push(`/dashboard/${datasetId}`);
                  } catch (e) {
                    setError("Failed to load sample");
                    setStatus("idle");
                  }
                }}
                className="text-[9px] mono uppercase text-text-tertiary hover:text-accent-main transition-colors flex items-center gap-1.5"
              >
                <span>or utilize</span>
                <span className="font-bold underline underline-offset-4">
                  Sales Demo Dataset
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full px-4"
            >
              <Loader2
                size={32}
                className="animate-spin text-accent-main mb-8 opacity-40"
              />
              <span className="text-[10px] mono uppercase font-bold text-accent-main tracking-widest mb-4 block text-center">
                Executing Secure Pipeline
              </span>
              <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-full bg-accent-main w-full"
                />
              </div>
              <p className="text-[10px] text-text-tertiary italic text-center">
                Cleansing and profiling data segments...
              </p>
            </motion.div>
          )}
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

      {error && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg w-full"
        >
          <span className="text-[9px] mono text-red-600 font-bold uppercase block text-center">
            {error}
          </span>
        </motion.div>
      )}
    </div>
  );
};
