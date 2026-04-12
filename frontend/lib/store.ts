import { create } from "zustand";
import {
  DatasetMeta,
  QueryResult,
  PipelineEvent,
  ChatSessionSummary,
} from "@/lib/types";

interface DashboardStore {
  // Dataset
  dataset: DatasetMeta | null;
  setDataset: (d: DatasetMeta) => void;

  // Queries
  queries: QueryResult[];
  setQueries: (q: QueryResult[]) => void;
  addQuery: (q: QueryResult) => void;
  chatSessionId: string | null;
  setChatSessionId: (id: string) => void;
  chatSessions: ChatSessionSummary[];
  setChatSessions: (sessions: ChatSessionSummary[]) => void;
  prependChatSession: (session: ChatSessionSummary) => void;
  activeQueryId: string | null;
  setActiveQuery: (id: string) => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  previewExpanded: boolean;
  togglePreview: () => void;

  // Active pipeline for real-time SSE
  activePipeline: {
    queryId: string;
    events: PipelineEvent[];
    status: "running" | "done" | "error";
  } | null;
  startPipeline: (id: string) => void;
  addPipelineEvent: (e: PipelineEvent) => void;
  clearPipeline: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  dataset: null,
  setDataset: (dataset) => set({ dataset }),

  queries: [],
  setQueries: (queries) => set({ queries }),
  addQuery: (query) =>
    set((state) => ({
      queries: [...state.queries, query],
      activePipeline: null, // Finish pipeline when query arrives
    })),
  chatSessionId: null,
  setChatSessionId: (id) => set({ chatSessionId: id }),
  chatSessions: [],
  setChatSessions: (chatSessions) => set({ chatSessions }),
  prependChatSession: (session) =>
    set((state) => ({
      chatSessions: [
        session,
        ...state.chatSessions.filter((s) => s._id !== session._id),
      ],
    })),
  activeQueryId: null,
  setActiveQuery: (id) => set({ activeQueryId: id }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  previewExpanded: false,
  togglePreview: () =>
    set((state) => ({ previewExpanded: !state.previewExpanded })),

  activePipeline: null,
  startPipeline: (queryId) =>
    set({
      activePipeline: { queryId, events: [], status: "running" },
    }),
  addPipelineEvent: (event) =>
    set((state) => ({
      activePipeline: state.activePipeline
        ? {
            ...state.activePipeline,
            events: [...state.activePipeline.events, event],
          }
        : null,
    })),
  clearPipeline: () => set({ activePipeline: null }),
}));
