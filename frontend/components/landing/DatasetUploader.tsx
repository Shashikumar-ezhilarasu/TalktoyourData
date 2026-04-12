"use client";
import React, { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Shield,
  Zap,
  Loader2,
  ArrowRight,
  Database,
  Clock3,
  Rows3,
  Columns3,
  LogIn,
  Sparkles,
} from "lucide-react";
import { DatasetMeta } from "@/lib/types";

export const DatasetUploader = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(auth.getUser());
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing">(
    "idle",
  );
  const [datasets, setDatasets] = useState<
    Array<
      Pick<
        DatasetMeta,
        | "_id"
        | "name"
        | "filename"
        | "uploadedAt"
        | "rowCount"
        | "columnCount"
        | "processingStatus"
      >
    >
  >([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadMyDatasets = async () => {
    if (!auth.getToken()) {
      setDatasets([]);
      return;
    }

    setLoadingDatasets(true);
    try {
      await api.datasets.claimLegacy();
      const response = await api.datasets.list();
      setDatasets(response.datasets);
    } catch (err) {
      console.error("Failed to load datasets", err);
      setDatasets([]);
    } finally {
      setLoadingDatasets(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMyDatasets();
    }
  }, [user]);

  const handleAuth = async () => {
    try {
      setError(null);
      if (mode === "register") {
        const response = await api.auth.register(name, email, password);
        auth.setSession(response.token, response.user);
        setUser(response.user);
        await loadMyDatasets();
        return;
      }

      const response = await api.auth.login(email, password);
      auth.setSession(response.token, response.user);
      setUser(response.user);
      await loadMyDatasets();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!user) {
      setError("Please login before uploading a dataset");
      return;
    }
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      setError("Only .csv and .json files are supported");
      return;
    }
    try {
      setStatus("uploading");
      const { datasetId } = await api.datasets.upload(file);
      await loadMyDatasets();
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
    <div className="flex flex-col items-center justify-center p-12">
      {!user && (
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-lg mb-6 rounded-2xl border border-bg-border bg-bg-base overflow-hidden shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]"
        >
          <div className="relative px-6 py-5 bg-gradient-to-br from-accent-main/20 via-accent-main/5 to-transparent border-b border-bg-border">
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-accent-main/15 blur-2xl" />
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="mono text-[10px] uppercase tracking-widest text-text-tertiary font-bold">
                Secure Access Portal
              </span>
              <Sparkles size={14} className="text-accent-main" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary">
              Welcome to DataLens
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Sign in to access your datasets and previous analysis sessions.
            </p>
          </div>

          <div className="p-5">
            <div className="flex rounded-xl bg-bg-elevated p-1 mb-4">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === "login" ? "bg-bg-base text-text-primary shadow-sm" : "text-text-tertiary"}`}
              >
                Login
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${mode === "register" ? "bg-bg-base text-text-primary shadow-sm" : "text-text-tertiary"}`}
              >
                Create Account
              </button>
            </div>

            {mode === "register" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full mb-2 px-3 py-2.5 text-sm border border-bg-border bg-bg-base text-text-primary rounded-md focus:outline-none focus:border-accent-main"
              />
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full mb-2 px-3 py-2.5 text-sm border border-bg-border bg-bg-base text-text-primary rounded-md focus:outline-none focus:border-accent-main"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full mb-4 px-3 py-2.5 text-sm border border-bg-border bg-bg-base text-text-primary rounded-md focus:outline-none focus:border-accent-main"
            />
            <button
              onClick={handleAuth}
              className="w-full py-2.5 rounded-xl bg-accent-main text-white text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <LogIn size={14} />
              {mode === "login" ? "Login to Continue" : "Create Account"}
            </button>
          </div>
        </motion.div>
      )}

      {user && (
        <div className="w-full max-w-lg mb-6 p-3 rounded-xl border border-bg-border bg-white flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            Signed in as <strong>{user.name}</strong>
          </span>
          <button
            onClick={() => {
              auth.clearSession();
              setUser(null);
              setDatasets([]);
            }}
            className="text-[10px] mono uppercase text-red-600 font-bold"
          >
            Logout
          </button>
        </div>
      )}

      {user && (
        <div className="w-full max-w-lg mb-6 rounded-xl border border-bg-border bg-bg-base overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-bg-border flex items-center justify-between bg-bg-surface">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-accent-main" />
              <span className="text-[10px] mono uppercase tracking-widest text-text-tertiary font-bold">
                My Datasets
              </span>
            </div>
            <span className="text-[10px] mono text-text-tertiary">
              {datasets.length}
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto p-2 space-y-2">
            {loadingDatasets && (
              <div className="px-3 py-3 text-xs text-text-secondary">
                Loading datasets...
              </div>
            )}

            {!loadingDatasets && datasets.length === 0 && (
              <div className="px-3 py-3 text-xs text-text-secondary">
                No datasets yet. Upload a CSV/JSON to get started.
              </div>
            )}

            {datasets.map((d) => (
              <button
                key={d._id}
                onClick={() => router.push(`/dashboard/${d._id}`)}
                className="w-full text-left p-3 rounded-lg border border-bg-border bg-bg-base hover:bg-bg-surface transition-all"
              >
                <div className="text-sm font-semibold text-text-primary line-clamp-1">
                  {d.name || d.filename}
                </div>
                <div className="mt-1 text-[10px] mono uppercase text-text-tertiary line-clamp-1">
                  {d.filename}
                </div>
                <div className="mt-2 flex items-center gap-3 text-[10px] text-text-tertiary">
                  <span className="inline-flex items-center gap-1">
                    <Rows3 size={10} /> {d.rowCount ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Columns3 size={10} /> {d.columnCount ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={10} />{" "}
                    {new Date(d.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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
        className={`w-full max-w-lg p-12 aspect-[4/5] border border-bg-border rounded-xl flex flex-col items-center justify-center text-center transition-all duration-700 relative group overflow-hidden bg-white shadow-xl shadow-black/[0.02]`}
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
              <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-accent-main mb-12 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Upload size={24} />
              </div>

              <h3 className="text-2xl font-medium text-text-primary mb-3">
                Initialize Analysis
              </h3>
              <p className="body text-text-tertiary mb-16 italic font-medium">
                Drop your dataset to begin interrogation.
              </p>

              <label className="btn-editorial cursor-pointer flex items-center gap-2 group/btn mb-10">
                <span>Attach Data</span>
                <ArrowRight
                  size={14}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
                <input
                  type="file"
                  className="hidden"
                  disabled={!user}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>

              <button
                disabled={!user}
                onClick={async () => {
                  setStatus("uploading");
                  try {
                    const token = auth.getToken();
                    const res = await fetch(
                      "http://localhost:4000/api/datasets/sample",
                      {
                        headers: token
                          ? { Authorization: `Bearer ${token}` }
                          : undefined,
                      },
                    );
                    if (!res.ok) {
                      throw new Error("Failed to load sample");
                    }
                    const { datasetId } = await res.json();
                    await loadMyDatasets();
                    router.push(`/dashboard/${datasetId}`);
                  } catch (e) {
                    setError("Failed to load sample");
                    setStatus("idle");
                  }
                }}
                className="text-[10px] mono uppercase text-text-tertiary hover:text-accent-main transition-colors flex items-center gap-1.5 disabled:opacity-40"
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
              className="flex flex-col items-center w-full px-8"
            >
              <Loader2
                size={40}
                className="animate-spin text-accent-main mb-12 opacity-40"
              />
              <span className="text-[11px] mono uppercase font-bold text-accent-main tracking-widest mb-6 block">
                Executing Secure Pipeline
              </span>
              <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden mb-6">
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
              <p className="text-xs text-text-tertiary italic">
                Cleansing and profiling data segments...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-12 flex items-center gap-10">
        {[
          { icon: <Shield size={14} />, label: "PII Scrubbing" },
          { icon: <Zap size={14} />, label: "Hyper-Fast" },
          { icon: <FileText size={14} />, label: "Auto-ID" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 text-text-tertiary"
          >
            {item.icon}
            <span className="text-[9px] mono uppercase font-bold tracking-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-10 px-6 py-4 bg-red-50 border border-red-100 rounded-lg"
        >
          <span className="text-[10px] mono text-red-600 font-bold uppercase">
            {error}
          </span>
        </motion.div>
      )}
    </div>
  );
};
