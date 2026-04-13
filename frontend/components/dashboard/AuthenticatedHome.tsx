"use client";
import React, { useState, useEffect, useRef } from 'react';
import { DatasetUploader } from '@/components/landing/DatasetUploader';
import { ChatInput } from "@/components/chat/ChatInput";
import { AnswerCard } from "@/components/answer/AnswerCard";
import { PipelineStatusBar } from "@/components/chat/PipelineStatusBar";
import { useDashboardStore } from "@/lib/store";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Clock, Search, Database, Layers, Brain } from "lucide-react";

export const AuthenticatedHome = () => {
  const { 
    chatSessions, 
    queries, 
    chatSessionId, 
    setChatSessionId, 
    setQueries,
    setChatSessions,
    startPipeline,
    addPipelineEvent,
    clearPipeline,
    addQuery,
    setDataset,
    dataset
  } = useDashboardStore();
  
  const [sessionSearch, setSessionSearch] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const sessionsResponse = await api.chat.listSessions();
        setChatSessions(sessionsResponse.sessions);
        
        // Load latest session by default if available
        if (sessionsResponse.sessions.length > 0) {
            loadSessionMessages(sessionsResponse.sessions[0]._id);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    init();
  }, []);

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const historyResponse = await api.chat.getMessages(sessionId);
      const history = historyResponse.messages.map((m: any) => ({
        ...m.result,
        _id: m._id,
        createdAt: m.createdAt,
        question: m.question,
      }));
      setQueries(history);
      setChatSessionId(sessionId);
      
      // If session belongs to a dataset, load dataset info
      if (historyResponse.session.datasetId) {
          const ds = await api.datasets.get(historyResponse.session.datasetId);
          setDataset(ds);
      }
    } catch (err) {
      console.error("Failed to load session messages", err);
    }
  };

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
        dataset?._id || "", // Use current dataset if available
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

      eventSource.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        addPipelineEvent(data);
        if (data.event === "insight_ready") {
          addQuery(data.data);
          setPendingQuestion(null);
          cleanupInFlightPipeline();
          clearPipeline();
          const latestSessions = await api.chat.listSessions();
          setChatSessions(latestSessions.sessions);
        }
      };

      eventSource.onerror = () => {
        cleanupInFlightPipeline();
        setPendingQuestion(null);
        clearPipeline();
      };
    } catch (err) {
      cleanupInFlightPipeline();
      setPendingQuestion(null);
      clearPipeline();
      console.error("Query failed", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] h-[calc(100vh-64px)] overflow-hidden bg-bg-base">
      {/* Left Column: Chat History */}
      <aside className="border-r border-bg-border bg-bg-base flex flex-col h-full overflow-hidden">
        <div className="p-6">
           <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-accent-main text-white shadow-sm mb-6">
              <Clock size={14} />
              <span className="text-[10px] mono uppercase font-bold tracking-widest">
                Analytics History
              </span>
            </div>
            
            <div className="relative mb-4">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder="Find session..."
                className="w-full bg-bg-elevated border border-bg-border rounded-md pl-8 pr-3 py-2 text-xs outline-none focus:border-accent-main"
              />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
          {chatSessions.filter(s => s.title.toLowerCase().includes(sessionSearch.toLowerCase())).map((session) => (
            <button 
              key={session._id}
              onClick={() => loadSessionMessages(session._id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                chatSessionId === session._id 
                ? "bg-accent-dim border-accent-main/30 shadow-sm" 
                : "bg-bg-base border-bg-border hover:border-text-primary/20"
              }`}
            >
              <p className="text-xs font-medium truncate mb-1">{session.title}</p>
              <div className="flex items-center justify-between">
                  <span className="text-[8px] mono text-text-tertiary uppercase font-bold">
                    {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Layers size={10} className="text-text-tertiary opacity-40" />
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Center Column: Chat & Results */}
      <main className="flex flex-col h-full overflow-hidden bg-bg-surface relative border-r border-bg-border">
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-10 relative z-10 scrollbar-hide">
           <PipelineStatusBar />
           
           {queries.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto">
               <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-accent-main mb-8">
                 <Brain size={32} />
               </div>
               <h2 className="text-4xl italic mb-6 font-normal tracking-tight">How can I help you analyze your data today?</h2>
               <p className="text-text-secondary text-sm leading-relaxed">
                 Select a previous session from the history or upload a new dataset on the right to start a fresh interrogation.
               </p>
             </div>
           ) : (
             <div className="max-w-3xl mx-auto space-y-8 pb-32">
                <AnimatePresence mode="popLayout">
                  {queries.map((q) => (
                    <motion.div key={q._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                       {q.question && (
                          <div className="flex justify-end mb-4">
                            <div className="bg-accent-main text-white text-xs px-4 py-2 rounded-2xl rounded-tr-none shadow-sm max-w-lg">
                              {q.question}
                            </div>
                          </div>
                       )}
                       <AnswerCard result={q} />
                    </motion.div>
                  ))}
                  {pendingQuestion && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                         <div className="bg-accent-main/80 text-white text-xs px-4 py-2 rounded-2xl rounded-tr-none animate-pulse">
                            {pendingQuestion}
                         </div>
                      </motion.div>
                  )}
                </AnimatePresence>
             </div>
           )}
        </div>
        
        <div className="p-8 bg-bg-base/80 backdrop-blur-md relative z-20 border-t border-bg-border/50">
          <div className="max-w-2xl mx-auto">
            <ChatInput onSend={handleQuery} />
          </div>
        </div>
      </main>

      {/* Right Column: Upload Data & Context */}
      <aside className="bg-bg-elevated/5 flex flex-col overflow-y-auto border-l border-bg-border/50">
        <div className="p-8 border-b border-bg-border/50 bg-bg-base/30">
           <div className="flex items-center gap-2 mb-6">
              <Database size={14} className="text-accent-main" />
              <h3 className="mono text-[10px] uppercase font-bold tracking-[0.2em] text-text-tertiary">
                Direct Ingestion
              </h3>
           </div>
           <DatasetUploader />
        </div>

        <div className="p-8 flex-1">
           <div className="flex items-center justify-between mb-4">
              <h4 className="mono text-[9px] uppercase font-bold text-text-tertiary tracking-widest">My Datasets</h4>
              <Database size={12} className="text-text-tertiary opacity-40" />
           </div>
           
           <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {/* This is the refined list, not the cluttered one removed from uploader */}
              {chatSessions.reduce((acc: any[], s) => {
                  if (s.datasetId && !acc.find(d => d._id === s.datasetId)) {
                      // Note: We'd normally get full dataset list from api.datasets.list()
                      // For now we derive from sessions or could call api.datasets.list() here
                  }
                  return acc;
              }, []).map((ds: any) => (
                  <button key={ds._id} className="w-full text-left p-2 rounded border border-bg-border bg-bg-base hover:bg-bg-elevated transition-all text-xs">
                     {ds.name}
                  </button>
              ))}
              <div className="text-[10px] text-text-tertiary italic">
                 Uploaded datasets will appear here for quick access.
              </div>
           </div>
        </div>
        
        <div className="mt-auto p-8 border-t border-bg-border/30">
           <div className="space-y-4">
              <div className="flex items-center justify-between text-[9px] mono uppercase font-bold text-text-tertiary">
                 <span>System State</span>
                 <span className="text-accent-main">Stable</span>
              </div>
              <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden">
                 <div className="w-3/4 h-full bg-accent-main/30" />
              </div>
           </div>
        </div>
      </aside>
    </div>
  );
};
