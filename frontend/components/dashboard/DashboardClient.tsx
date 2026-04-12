"use client";
import React, { useEffect, useRef, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ChatInput } from "@/components/chat/ChatInput";
import { PipelineStatusBar } from "@/components/chat/PipelineStatusBar";
import { AnswerCard } from "@/components/answer/AnswerCard";
import { useDashboardStore } from "@/lib/store";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  LayoutGrid,
  Clock,
  Plus,
  Zap,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { auth } from "@/lib/auth";

export default function DashboardClient({ datasetId }: { datasetId: string }) {
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    setDataset,
    setQueries,
    queries,
    addQuery,
    startPipeline,
    addPipelineEvent,
    clearPipeline,
    dataset,
    chatSessionId,
    setChatSessionId,
    chatSessions,
    setChatSessions,
    prependChatSession,
  } = useDashboardStore();

  const formatWhen = (value: string) => {
    const dt = new Date(value);
    return dt.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadSessionMessages = async (sessionId: string) => {
    const historyResponse = await api.chat.getMessages(sessionId);
    const history = historyResponse.messages.map((m) => ({
      ...m.result,
      _id: m._id,
      createdAt: m.createdAt,
      question: m.question,
    }));

    setQueries(history);
    setChatSessionId(sessionId);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [datasetResponse, sessionsResponse] = await Promise.all([
          api.datasets.get(datasetId),
          api.chat.listSessions(datasetId),
        ]);

        setDataset(datasetResponse);
        setChatSessions(sessionsResponse.sessions);

        if (sessionsResponse.sessions.length > 0) {
          await loadSessionMessages(sessionsResponse.sessions[0]._id);
        } else {
          const sessionResponse = await api.chat.ensureSession(datasetId);
          const newSession = {
            _id: sessionResponse.session._id,
            title: sessionResponse.session.title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          prependChatSession(newSession);
          setChatSessionId(newSession._id);
          setQueries([]);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };

    loadDashboardData();
  }, [
    datasetId,
    setDataset,
    setQueries,
    setChatSessionId,
    setChatSessions,
    prependChatSession,
  ]);

  const createNewSession = async () => {
    try {
      const response = await api.chat.ensureSession(datasetId, undefined, true);
      const now = new Date().toISOString();
      const newSession = {
        _id: response.session._id,
        title: response.session.title,
        createdAt: now,
        updatedAt: now,
      };

      prependChatSession(newSession);
      setChatSessionId(newSession._id);
      setQueries([]);
    } catch (error) {
      console.error("Failed to create new session", error);
    }
  };

  const renameSession = async (sessionId: string, currentTitle: string) => {
    const nextTitle = window.prompt("Rename chat", currentTitle);
    if (!nextTitle || !nextTitle.trim()) {
      return;
    }

    try {
      await api.chat.renameSession(sessionId, nextTitle.trim());
      const latestSessions = await api.chat.listSessions(datasetId);
      setChatSessions(latestSessions.sessions);
    } catch (error) {
      console.error("Failed to rename session", error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!window.confirm("Delete this chat session and all its messages?")) {
      return;
    }

    try {
      await api.chat.deleteSession(sessionId);
      const latestSessions = await api.chat.listSessions(datasetId);
      setChatSessions(latestSessions.sessions);

      if (chatSessionId === sessionId) {
        if (latestSessions.sessions.length > 0) {
          await loadSessionMessages(latestSessions.sessions[0]._id);
        } else {
          const created = await api.chat.ensureSession(
            datasetId,
            undefined,
            true,
          );
          const now = new Date().toISOString();
          const replacement = {
            _id: created.session._id,
            title: created.session.title,
            createdAt: now,
            updatedAt: now,
          };
          prependChatSession(replacement);
          setChatSessionId(replacement._id);
          setQueries([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete session", error);
    }
  };

  const filteredSessions = chatSessions.filter((session) =>
    session.title.toLowerCase().includes(sessionSearch.toLowerCase()),
  );

  const handleQuery = async (question: string) => {
    const cleanupInFlightPipeline = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };

    try {
      cleanupInFlightPipeline();
      setPendingQuestion(question);

      const response = (await api.query.submit(
        datasetId,
        question,
        chatSessionId || undefined,
      )) as any;
      const { queryId, sessionId } = response;
      if (sessionId) {
        setChatSessionId(sessionId);
      }
      startPipeline(queryId);

      const host = window.location.hostname;
      const token = auth.getToken();
      const streamUrl = `http://${host}:4000/api/stream/${queryId}?token=${encodeURIComponent(token || "")}`;
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      timeoutRef.current = setTimeout(() => {
        cleanupInFlightPipeline();
        setPendingQuestion(null);
        clearPipeline();
        console.error(
          "Pipeline stream timed out. You can submit another question.",
        );
      }, 60000);

      eventSource.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        addPipelineEvent(data);
        if (data.event === "insight_ready") {
          addQuery(data.data);
          setPendingQuestion(null);
          cleanupInFlightPipeline();
          clearPipeline();
          const latestSessions = await api.chat.listSessions(datasetId);
          setChatSessions(latestSessions.sessions);
        }
        if (data.event === "error") {
          console.error("Pipeline error:", data.data);
          setPendingQuestion(null);
          cleanupInFlightPipeline();
          clearPipeline();
        }
      };

      eventSource.onerror = () => {
        cleanupInFlightPipeline();
        setPendingQuestion(null);
        clearPipeline();
      };
    } catch (err) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setPendingQuestion(null);
      clearPipeline();
      console.error("Query submission failed", err);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <DashboardShell
      sidebar={
        <div className="flex flex-col h-full py-8">
          <div className="px-6 mb-10">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-accent-main text-white shadow-sm mb-6">
              <LayoutGrid size={14} />
              <span className="text-[11px] mono uppercase font-bold tracking-widest">
                Dashboard
              </span>
            </div>

            <button
              onClick={createNewSession}
              className="w-full mb-4 flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-bg-border bg-bg-elevated hover:bg-bg-surface transition-all text-[11px] mono uppercase font-bold tracking-widest text-text-primary"
            >
              <Plus size={14} />
              New Chat
            </button>

            <div className="space-y-1">
              <div className="px-3 py-2 flex items-center justify-between group cursor-pointer hover:bg-bg-elevated rounded-md transition-all">
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-text-tertiary" />
                  <span className="text-xs font-medium text-text-secondary">
                    History
                  </span>
                </div>
                <span className="text-[10px] mono text-text-tertiary bg-bg-border px-1.5 py-0.5 rounded-sm">
                  {chatSessions.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="mono text-[9px] uppercase text-text-tertiary mb-4 tracking-[0.2em] px-3 font-bold">
              Recent Chat Rooms
            </div>
            <div className="mb-3 px-3 relative">
              <Search
                size={12}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder="Search sessions..."
                className="w-full rounded-md border border-bg-border bg-bg-elevated text-text-primary placeholder:text-text-tertiary pl-8 pr-3 py-2 text-xs outline-none focus:border-accent-main"
              />
            </div>
            <div className="space-y-2">
              {filteredSessions.map((session, idx) => (
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={session._id}
                  onClick={() => loadSessionMessages(session._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      loadSessionMessages(session._id);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-all group shadow-sm hover:shadow-md ${
                    chatSessionId === session._id
                      ? "bg-accent-dim border-accent-main/30"
                      : "bg-bg-base border-bg-border hover:border-black"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-main" />
                      <span className="mono text-[8px] uppercase font-bold tracking-widest text-text-tertiary">
                        Session
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          renameSession(session._id, session.title);
                        }}
                        className="p-1 rounded hover:bg-bg-elevated"
                        title="Rename chat"
                      >
                        <Pencil size={12} className="text-text-tertiary" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session._id);
                        }}
                        className="p-1 rounded hover:bg-red-dim/60"
                        title="Delete chat"
                      >
                        <Trash2 size={12} className="text-red" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-text-primary leading-snug line-clamp-2">
                    {session.title}
                  </div>
                  <div className="text-[9px] mono uppercase text-text-tertiary mt-2">
                    {formatWhen(session.updatedAt)}
                  </div>
                </motion.div>
              ))}
              {filteredSessions.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-bg-border rounded-xl">
                  <MessageSquare
                    className="mx-auto mb-3 text-bg-border"
                    size={20}
                  />
                  <span className="text-[10px] mono uppercase text-text-tertiary block">
                    Standby
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="h-full w-full overflow-y-auto bg-bg-surface relative py-10">
        {/* Background Dot Grid */}
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-40" />

        <div className="max-w-5xl mx-auto px-6 lg:px-10 pb-64 relative z-10">
          {queries.length === 0 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative w-32 h-32 mb-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 border-[0.5px] border-text-primary/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-4 border-[0.5px] border-text-primary/10 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={32} className="text-text-primary opacity-30" />
                </div>
              </div>

              <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-text-tertiary mb-4 font-bold block">
                Dataset Vectorized & Ready
              </span>
              <div className="flex gap-6 mb-10 text-sm font-medium text-text-secondary bg-bg-elevated px-6 py-3 rounded-full border border-bg-border">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-bold">
                    {dataset?.rowCount?.toLocaleString() || 0}
                  </span>{" "}
                  Rows
                </div>
                <div className="w-[1px] h-4 bg-bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-bold">
                    {dataset?.columnCount?.toLocaleString() || 0}
                  </span>{" "}
                  Columns
                </div>
                <div className="w-[1px] h-4 bg-bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-bold">
                    {(dataset?.rowCount || 0) * (dataset?.columnCount || 0)}
                  </span>{" "}
                  Data Points
                </div>
              </div>

              <h2 className="text-5xl font-normal italic tracking-tight text-text-primary mb-8 max-w-2xl leading-[1.1]">
                What shall we explore in your data today?
              </h2>
              <div className="flex gap-4">
                <button className="btn-editorial">Recent Trends</button>
                <button className="btn-ghost">Anomalies</button>
              </div>
            </motion.div>
          )}

          <PipelineStatusBar />

          <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
              {queries.map((q) => (
                <motion.div key={q._id} layout>
                  {q.question && (
                    <motion.div
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mb-4 ml-auto max-w-2xl rounded-2xl bg-accent-main text-white px-5 py-3 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.35)]"
                    >
                      <div className="text-[10px] mono uppercase tracking-widest opacity-80 mb-1">
                        You
                      </div>
                      <div className="text-sm leading-relaxed">
                        {q.question}
                      </div>
                    </motion.div>
                  )}
                  <AnswerCard result={q} />
                </motion.div>
              ))}
            </AnimatePresence>

            {pendingQuestion && (
              <>
                <motion.div
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-4 ml-auto max-w-2xl rounded-2xl bg-accent-main text-white px-5 py-3 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.35)]"
                >
                  <div className="text-[10px] mono uppercase tracking-widest opacity-80 mb-1">
                    You
                  </div>
                  <div className="text-sm leading-relaxed">
                    {pendingQuestion}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-10 max-w-2xl rounded-2xl border border-bg-border bg-bg-base px-5 py-4 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] overflow-hidden"
                >
                  <div className="relative mb-3 h-1 rounded-full bg-bg-elevated overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.8,
                        ease: "linear",
                      }}
                      className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-accent-main to-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] mono uppercase tracking-widest text-text-tertiary mb-1">
                        DataLens is thinking
                      </div>
                      <div className="text-sm text-text-primary font-medium">
                        Building your insight with semantic reasoning...
                      </div>
                    </div>

                    <div className="flex items-end gap-1.5">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.9,
                            delay: dot * 0.15,
                            ease: "easeInOut",
                          }}
                          className="w-2.5 h-2.5 rounded-full bg-accent-main"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6">
          <div className="w-full">
            <ChatInput onSend={handleQuery} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
