"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { User, Database, Settings, ChevronLeft, Save, Loader2, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const [contextMemory, setContextMemory] = useState("");
  const [datasetCount, setDatasetCount] = useState(0);
  const [status, setStatus] = useState<"loading" | "idle" | "saving">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.auth.me();
        setContextMemory(data.user.contextMemory || "");
        setDatasetCount(data.user.datasetCount || 0);
        setStatus("idle");
      } catch (err) {
        console.error("Failed to load profile", err);
        setStatus("idle");
      }
    };
    if (isLoaded && clerkUser) {
        fetchData();
    }
  }, [isLoaded, clerkUser]);

  const handleSave = async () => {
    try {
      setStatus("saving");
      await api.auth.updateProfile(contextMemory);
      setStatus("idle");
      // Optional: show a toast notification here
    } catch (err) {
      setError("Failed to save memory context.");
      setStatus("idle");
    }
  };

  if (!isLoaded || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base">
        <Loader2 className="animate-spin text-accent-main" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-surface py-12 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-[10px] mono uppercase tracking-widest text-text-tertiary hover:text-accent-main transition-colors mb-10"
        >
          <ChevronLeft size={16} /> Returns to Terminal
        </button>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-4xl italic font-normal tracking-tight text-text-primary mb-2">User Profile</h1>
          <p className="text-sm text-text-tertiary mb-12">Manage your personalization logic and data presence.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <motion.div 
               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
               className="card-prime rounded-2xl flex flex-col items-center text-center p-8 border border-bg-border/60 bg-bg-base"
            >
              <div className="w-20 h-20 bg-accent-main rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg shadow-accent-main/20">
                {clerkUser?.firstName?.charAt(0) || "U"}
              </div>
              <h2 className="text-lg font-medium text-text-primary">{clerkUser?.fullName || "Analyst"}</h2>
              <p className="text-xs text-text-tertiary mono mt-1">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="card-prime flex flex-col p-6 rounded-2xl border border-bg-border/60 bg-bg-base"
            >
              <div className="flex items-center justify-between mb-4 text-text-secondary">
                <span className="text-[10px] mono uppercase font-bold tracking-widest flex items-center gap-2"><Database size={12}/> Repository Status</span>
              </div>
              <div className="flex bg-bg-elevated p-4 rounded-xl items-center gap-4">
                 <div className="p-3 bg-accent-soft rounded-lg text-accent-main">
                   <Database size={20} />
                 </div>
                 <div>
                    <div className="text-sm text-text-tertiary font-medium">Datasets Uploaded</div>
                    <div className="text-2xl text-text-primary font-bold font-mono">{datasetCount}</div>
                 </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
             initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
             className="md:col-span-2 card-prime p-8 rounded-2xl border border-bg-border/60 bg-bg-base flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 rounded-full bg-accent-main flex items-center justify-center text-white">
                 <BrainCircuit size={16} />
               </div>
               <div>
                 <h3 className="text-lg font-medium text-text-primary">Personalized Context Memory</h3>
                 <p className="text-xs text-text-tertiary mt-1">DataLens learns how you prefer your insights. Input permanent directives here.</p>
               </div>
            </div>

            <div className="flex-1 mb-6">
              <label className="text-[10px] mono uppercase font-bold text-text-secondary tracking-widest mb-3 block">System Prompt Extender</label>
              <textarea
                value={contextMemory}
                onChange={(e) => setContextMemory(e.target.value)}
                placeholder="e.g. Always summarize numbers in thousands. Prefer bar charts for anomalies. Call me 'Commander'."
                className="w-full h-48 bg-bg-surface border border-bg-border rounded-xl p-4 text-sm text-text-primary outline-none focus:border-accent-main focus:ring-1 focus:ring-accent-main/30 transition-all resize-none font-mono"
              />
            </div>

            {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

            <div className="mt-auto flex justify-end">
              <button
                onClick={handleSave}
                disabled={status === "saving"}
                className="btn-editorial flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "saving" ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                <span className="tracking-widest uppercase text-[10px]">{status === "saving" ? "Saving..." : "Save Directives"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
