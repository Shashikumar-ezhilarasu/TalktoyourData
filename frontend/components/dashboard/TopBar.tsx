"use client";
import React, { useEffect, useState } from "react";
import { useDashboardStore } from "@/lib/store";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { LogOut, Database, Layers, Activity, Moon, Sun } from "lucide-react";

export const TopBar = () => {
  const { dataset } = useDashboardStore();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("datalens_theme") as
      | "light"
      | "dark"
      | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("datalens_theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-[72px] border-b border-bg-border bg-bg-base/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50 shadow-[0_12px_40px_-28px_rgba(2,8,23,0.45)]"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent-main/50 to-transparent" />

      <div className="flex items-center gap-10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-accent-main rounded-md flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform duration-500 shadow-[0_0_12px_rgba(37,99,235,0.35)]">
            <span className="text-white text-[10px] -rotate-45 group-hover:-rotate-90 transition-transform duration-500">
              ✦
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[12px] uppercase tracking-[0.35em] text-text-primary">
              DataLens
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-text-tertiary">
              Insight Console
            </span>
          </div>
        </Link>

        {dataset && (
          <div className="hidden lg:flex items-center gap-6 rounded-full border border-bg-border bg-bg-elevated/60 px-4 py-2">
            <div className="flex items-center gap-2">
              <Database size={12} className="text-text-tertiary" />
              <span className="mono text-[9px] uppercase tracking-widest text-text-secondary">
                {dataset.filename}
              </span>
            </div>
            <div className="h-4 w-[1px] bg-bg-border" />
            <div className="flex items-center gap-2">
              <Layers size={12} className="text-text-tertiary" />
              <span className="mono text-[9px] uppercase tracking-widest text-text-secondary">
                {dataset.rowCount?.toLocaleString() || "---"}{" "}
                <span className="text-text-tertiary">Entries</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="btn-ghost flex items-center gap-2 !px-3 !py-1.5"
          aria-label="Toggle theme"
          title={
            theme === "light" ? "Switch to dark theme" : "Switch to light theme"
          }
        >
          {theme === "light" ? <Moon size={12} /> : <Sun size={12} />}
          <span>{theme === "light" ? "Dark" : "Light"}</span>
        </button>

        {dataset && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-bg-border shadow-sm"
          >
            <Activity size={10} className="text-text-primary animate-pulse" />
            <span className="text-[9px] mono uppercase font-bold tracking-tight text-text-primary">
              {dataset.processingStatus === "ready"
                ? "Analytical Engine: Live"
                : "Processing Stream"}
            </span>
          </motion.div>
        )}

        <Link
          href="/profile"
          className="btn-ghost hidden md:flex items-center gap-2 !px-3 !py-1.5"
        >
          <span>Profile</span>
        </Link>

        <UserButton />

        <Link
          href="/"
          className="btn-ghost flex items-center gap-2 !px-3 !py-1.5"
        >
          <LogOut size={12} />
          <span>Exit</span>
        </Link>
      </div>
    </motion.header>
  );
};
