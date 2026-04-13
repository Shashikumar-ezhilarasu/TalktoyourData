"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowUpRight,
  Database,
  Loader2,
  Search,
  Sparkles,
  Table,
  Upload,
} from "lucide-react";
import { api } from "@/lib/api";
import { DatasetMeta } from "@/lib/types";
import { TopBar } from "@/components/dashboard/TopBar";

type DatasetListItem = Pick<
  DatasetMeta,
  | "_id"
  | "name"
  | "filename"
  | "uploadedAt"
  | "rowCount"
  | "columnCount"
  | "processingStatus"
>;

const statusPalette: Record<DatasetListItem["processingStatus"], string> = {
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
};

const formatDate = (input: string) =>
  new Date(input).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const DatasetHubPage = () => {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const [datasets, setDatasets] = useState<DatasetListItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!userId) {
      setIsLoading(false);
      setDatasets([]);
      setError("Please sign in to view your datasets.");
      return;
    }

    const loadDatasets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.datasets.list();
        const sorted = [...response.datasets].sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        );
        setDatasets(sorted);
      } catch (err: any) {
        setError(err.message || "Failed to load datasets");
      } finally {
        setIsLoading(false);
      }
    };

    loadDatasets();
  }, [isLoaded, userId]);

  const filteredDatasets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return datasets;

    return datasets.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.filename.toLowerCase().includes(query),
    );
  }, [datasets, search]);

  const readyCount = datasets.filter(
    (d) => d.processingStatus === "ready",
  ).length;

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      setError("Only .csv and .json files are supported.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const { datasetId } = await api.datasets.upload(file);
      router.push(`/dashboard/${datasetId}`);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <TopBar />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-accent-glow blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-accent-glow blur-3xl" />
          <div className="absolute inset-0 dot-grid opacity-35" />
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-col gap-4"
          >
            <p className="mono text-[10px] uppercase tracking-[0.26em] text-text-tertiary font-bold">
              Dataset Command Center
            </p>
            <h1 className="max-w-3xl text-4xl leading-tight text-text-primary md:text-5xl">
              Choose a dataset to start a focused analytics conversation.
            </h1>
            <p className="max-w-3xl text-sm text-text-secondary md:text-base">
              This workspace keeps all uploads in one formal dashboard so you
              can quickly jump into chat sessions or ingest new data.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload size={14} className="text-accent" />
                  <h2 className="mono text-[11px] uppercase tracking-[0.22em] font-bold text-text-tertiary">
                    Upload New Dataset
                  </h2>
                </div>
                {isUploading && (
                  <Loader2 size={14} className="animate-spin text-accent" />
                )}
              </div>

              <label className="block cursor-pointer rounded-xl border border-dashed border-bg-border bg-bg-surface p-8 text-center transition-colors hover:border-accent">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-dim text-accent">
                  <Database size={20} />
                </div>
                <p className="text-sm font-medium text-text-primary">
                  Drop file or click to upload
                </p>
                <p className="mt-2 text-xs text-text-tertiary">
                  Supported: CSV, JSON
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      void handleUpload(file);
                    }
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsUploading(true);
                    setError(null);
                    const res = await fetch(
                      "http://localhost:4000/api/datasets/sample",
                    );
                    if (!res.ok) throw new Error("Failed to load sample");
                    const { datasetId } = await res.json();
                    router.push(`/dashboard/${datasetId}`);
                  } catch {
                    setError("Failed to load sample dataset");
                  } finally {
                    setIsUploading(false);
                  }
                }}
                className="mt-4 w-full btn-ghost"
                disabled={isUploading}
              >
                Use Sales Demo Dataset
              </button>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-bg-border bg-bg-base p-4">
                  <p className="mono text-[9px] uppercase tracking-widest text-text-tertiary">
                    Total Datasets
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-text-primary">
                    {datasets.length}
                  </p>
                </div>
                <div className="rounded-xl border border-bg-border bg-bg-base p-4">
                  <p className="mono text-[9px] uppercase tracking-widest text-text-tertiary">
                    Ready To Chat
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-text-primary">
                    {readyCount}
                  </p>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {error}
                </p>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl text-text-primary">
                    Your Uploaded Datasets
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Select one to open the conversation workspace.
                  </p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search dataset name or file"
                    className="w-full rounded-lg border border-bg-border bg-bg-surface py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="animate-spin text-accent" size={22} />
                </div>
              ) : filteredDatasets.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-bg-border bg-bg-surface text-center">
                  <Table size={22} className="text-text-tertiary mb-3" />
                  <p className="text-sm text-text-primary">No datasets found</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Upload your first dataset to start chatting.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredDatasets.map((dataset, index) => (
                    <motion.article
                      key={dataset._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="rounded-xl border border-bg-border bg-bg-base p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-text-primary line-clamp-1">
                            {dataset.name}
                          </p>
                          <p className="text-xs text-text-tertiary mt-1 line-clamp-1">
                            {dataset.filename}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide ${statusPalette[dataset.processingStatus]}`}
                        >
                          {dataset.processingStatus}
                        </span>
                      </div>

                      <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-text-secondary">
                        <div className="rounded-md bg-bg-surface p-2">
                          <p className="mono text-[9px] uppercase text-text-tertiary">
                            Rows
                          </p>
                          <p className="mt-1 text-sm font-semibold text-text-primary">
                            {dataset.rowCount.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-md bg-bg-surface p-2">
                          <p className="mono text-[9px] uppercase text-text-tertiary">
                            Columns
                          </p>
                          <p className="mt-1 text-sm font-semibold text-text-primary">
                            {dataset.columnCount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-text-tertiary">
                          Uploaded {formatDate(dataset.uploadedAt)}
                        </span>
                        <Link
                          href={`/dashboard/${dataset._id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-bg-border bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
                        >
                          Open Chat
                          <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.section>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-bg-base/85 backdrop-blur-md"
          >
            <div className="relative h-full w-full flex items-center justify-center px-6">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-1/3 left-1/4 h-56 w-56 rounded-full bg-accent-glow blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent-glow blur-3xl" />
              </div>

              <div className="relative w-full max-w-xl rounded-2xl border border-bg-border bg-bg-base/90 p-10 text-center shadow-[0_30px_80px_-32px_rgba(0,0,0,0.35)] overflow-hidden">
                <motion.div
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4,
                    ease: "linear",
                  }}
                  className="absolute top-0 h-[2px] w-1/2 bg-gradient-to-r from-transparent via-accent-main to-transparent"
                />

                <div className="mx-auto mb-6 relative h-20 w-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.2,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border-2 border-accent-main/25 border-t-accent-main"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 3.2,
                      ease: "linear",
                    }}
                    className="absolute inset-2 rounded-full border border-accent-main/20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-accent-main">
                    <Sparkles size={20} />
                  </div>
                </div>

                <p className="mono text-[10px] uppercase tracking-[0.25em] font-bold text-text-tertiary mb-3">
                  Ingestion Pipeline Active
                </p>
                <h3 className="text-2xl italic text-text-primary mb-3">
                  Crafting your dataset workspace...
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  Profiling columns, scrubbing sensitive data, and preparing
                  semantic context.
                </p>

                <div className="mx-auto max-w-sm h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                      ease: "easeInOut",
                    }}
                    className="h-full w-2/3 bg-gradient-to-r from-transparent via-accent-main to-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
