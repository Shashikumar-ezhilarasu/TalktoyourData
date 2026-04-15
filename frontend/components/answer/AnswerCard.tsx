"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { QueryResult } from "@/lib/types";
import { NumberTicker } from "../ui/NumberTicker";
import { ChartModule } from "./ChartModule";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Info,
  Share2,
  CornerDownRight,
  Download,
  Image as ImageIcon,
} from "lucide-react";

export const AnswerCard = ({ result }: { result: QueryResult }) => {
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const hasMetricValue = Number.isFinite(result.metricValue);
  const hasContextualVariance =
    Number.isFinite(result.changeValue) && result.changeDirection !== "none";
  const hasProcessLatency =
    Number.isFinite(result.durationMs) && result.durationMs > 0;

  const confidenceRaw = Number(result.confidence);
  const confidencePercent = Number.isFinite(confidenceRaw)
    ? Math.max(
        0,
        Math.min(100, confidenceRaw <= 1 ? confidenceRaw * 100 : confidenceRaw),
      )
    : null;

  const normalizedIntent = String(result.intent || "").toUpperCase();
  const displayIntent =
    normalizedIntent === "GENERAL" ? null : normalizedIntent;
  const hasChartData =
    Array.isArray(result.chartData?.labels) &&
    Array.isArray(result.chartData?.values) &&
    result.chartData.labels.length > 0 &&
    result.chartData.values.length > 0;

  const fileBase = useMemo(() => {
    const raw = result.headline || result.question || "chat";
    const trimmed = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
    return trimmed || "chat";
  }, [result.headline, result.question]);

  useEffect(() => {
    if (!shareOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!shareRef.current) return;
      if (shareRef.current.contains(event.target as Node)) return;
      setShareOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [shareOpen]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const getChartPngDataUrl = async () => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return null;

    const bbox = svg.getBoundingClientRect();
    const width = Math.max(1, Math.round(bbox.width || 0)) || 800;
    const height = Math.max(1, Math.round(bbox.height || 0)) || 420;

    const xml = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = new window.Image();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("Failed to render chart"));
        img.src = url;
      });
      return dataUrl;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const handleExportChart = async () => {
    const dataUrl = await getChartPngDataUrl();
    if (!dataUrl) return;
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    downloadBlob(blob, `${fileBase}-chart.png`);
    setShareOpen(false);
  };

  const handleExportChat = async () => {
    const chartDataUrl = await getChartPngDataUrl();
    const question = result.question ? `<p>${result.question}</p>` : "";
    const chartBlock = chartDataUrl
      ? `<div class="chart"><img src="${chartDataUrl}" alt="Chart" /></div>`
      : "";

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${result.headline || "Chat Export"}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; padding: 32px; background: #f8fafc; }
      .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
      .label { text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; color: #64748b; }
      h1 { font-size: 28px; margin: 12px 0 16px; }
      p { font-size: 16px; line-height: 1.6; margin: 0 0 16px; }
      .meta { color: #475569; font-size: 14px; }
      .chart { margin-top: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
      .chart img { max-width: 100%; height: auto; display: block; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="label">Chat Export</div>
      <h1>${result.headline || "Chat Insight"}</h1>
      ${question}
      <p>${result.explanation}</p>
      <div class="meta">${result.sourceSummary || ""}</div>
      ${chartBlock}
    </div>
  </body>
</html>`;

    downloadBlob(new Blob([html], { type: "text/html" }), `${fileBase}.html`);
    setShareOpen(false);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-bg-base border border-bg-border rounded-lg mb-10 overflow-hidden shadow-[0_4px_20px_-10px_rgba(2,8,23,0.16)] hover:shadow-[0_20px_40px_-15px_rgba(2,8,23,0.28)] transition-all duration-700"
    >
      {/* Precision Header */}
      <div className="px-8 py-4 border-b border-bg-border flex items-center justify-between bg-bg-surface/50">
        <div className="flex items-center gap-5">
          {displayIntent && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-accent-main text-white">
              <ShieldCheck size={12} />
              <span className="mono text-[9px] uppercase tracking-[0.2em] font-bold">
                {displayIntent}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 relative" ref={shareRef}>
          <button
            type="button"
            onClick={() => setShareOpen((open) => !open)}
            className="text-text-tertiary hover:text-accent-main transition-colors"
            aria-label="Share and export"
          >
            <Share2 size={14} />
          </button>

          <AnimatePresence>
            {shareOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute right-8 top-12 w-64 rounded-xl border border-bg-border bg-bg-base/95 backdrop-blur-lg shadow-[0_18px_60px_-30px_rgba(2,8,23,0.5)] p-3 z-20"
              >
                <div className="text-[9px] mono uppercase tracking-[0.3em] text-text-tertiary px-2 pb-2">
                  Share Options
                </div>
                <button
                  type="button"
                  onClick={handleExportChat}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-bg-elevated transition-colors"
                >
                  <span className="w-8 h-8 rounded-md bg-accent-soft text-accent-main flex items-center justify-center">
                    <Download size={14} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      Export Chat
                    </div>
                    <div className="text-[10px] text-text-tertiary">
                      Text response + chart
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleExportChart}
                  disabled={!hasChartData}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    hasChartData
                      ? "hover:bg-bg-elevated"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span className="w-8 h-8 rounded-md bg-bg-elevated text-text-primary flex items-center justify-center">
                    <ImageIcon size={14} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      Export Chart
                    </div>
                    <div className="text-[10px] text-text-tertiary">
                      Image only
                    </div>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-10">
        {/* Editorial Headline */}
        <h2 className="text-4xl font-normal italic text-text-primary mb-10 leading-tight tracking-tight">
          {result.headline}
        </h2>

        {/* Metric Grid */}
        {(hasMetricValue || hasContextualVariance || hasProcessLatency) && (
          <div className="grid gap-px bg-bg-border border border-bg-border rounded-sm overflow-hidden mb-12 shadow-sm [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {hasMetricValue && (
              <div className="bg-bg-base p-8 group">
                <span className="mono text-[9px] uppercase text-text-tertiary block mb-3 tracking-[0.2em] group-hover:text-accent-main transition-colors">
                  {result.metricName}
                </span>
                <div className="flex items-baseline gap-4">
                  <NumberTicker value={result.metricValue} decimals={2} />
                  <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                </div>
              </div>
            )}

            {hasContextualVariance && (
              <div className="bg-bg-base p-8">
                <span className="mono text-[9px] uppercase text-text-tertiary block mb-3 tracking-[0.2em]">
                  Contextual Variance
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-2xl font-light italic ${result.changeDirection === "up" ? "text-green" : "text-text-secondary"}`}
                  >
                    {result.changeDirection === "up" ? "+" : "-"}
                    {Math.abs(result.changeValue)}%
                  </span>
                  <div className="text-[9px] mono uppercase px-2 py-0.5 border border-bg-border text-text-tertiary rounded-sm">
                    vs Baseline
                  </div>
                </div>
              </div>
            )}

            {hasProcessLatency && (
              <div className="bg-bg-base p-8 flex flex-col justify-center">
                <span className="mono text-[9px] uppercase text-text-tertiary block mb-3 tracking-[0.2em]">
                  Process Latency
                </span>
                <span className="text-xl font-light mono text-text-secondary">
                  {Math.round(result.durationMs)}ms
                </span>
              </div>
            )}
          </div>
        )}

        {/* Insight Breakdown */}
        <div
          className={`flex flex-col gap-16 items-start ${
            hasChartData ? "lg:flex-row" : ""
          }`}
        >
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

          {hasChartData && (
            <div className="w-full lg:w-[480px]">
              <div
                className="p-4 bg-bg-surface border border-bg-border rounded-lg"
                ref={chartRef}
              >
                <ChartModule
                  type={
                    normalizedIntent === "BREAKDOWN"
                      ? "bar"
                      : normalizedIntent === "COMPARE" ||
                          normalizedIntent === "COMPARISON"
                        ? "comparison"
                        : normalizedIntent === "ANOMALY"
                          ? "bar"
                          : "pie"
                  }
                  data={result.chartData}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trust Footer */}
      <div className="px-10 py-5 bg-bg-elevated/30 border-t border-bg-border flex items-center justify-between">
        <div className="flex items-center gap-8">
          {confidencePercent !== null && (
            <div className="flex flex-col gap-2">
              <div className="w-40 h-1 bg-bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-accent-main"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="mono text-[8px] uppercase font-bold text-text-tertiary">
                  Precision Index
                </span>
                <span className="mono text-[8px] uppercase font-bold text-accent-main">
                  {Math.round(confidencePercent)}%
                </span>
              </div>
            </div>
          )}
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
