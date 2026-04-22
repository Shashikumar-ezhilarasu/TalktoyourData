import {
  DatasetMeta,
  ProcessingStatus,
  QueryResult,
  ClarificationResponse,
} from "./types";
import { auth, AuthUser } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await auth.getTokenAsync();
  const headers = new Headers(options?.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    auth.clearSession();
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(res.status, error.error || res.statusText);
  }
  return res.json();
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ user: AuthUser & { contextMemory?: string; datasetCount?: number } }>("/auth/me"),
    updateProfile: (contextMemory: string) =>
      request<{ message: string; contextMemory: string }>("/auth/me/context", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextMemory }),
      }),
  },
  datasets: {
    upload: async (
      file: File,
      name?: string,
    ): Promise<{ datasetId: string }> => {
      const formData = new FormData();
      formData.append("file", file);
      if (name) formData.append("name", name);

      return request<{ datasetId: string }>("/datasets/upload", {
        method: "POST",
        body: formData,
      });
    },
    get: (id: string) => request<DatasetMeta>(`/datasets/${id}`),
    list: () =>
      request<{
        datasets: Array<
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
        >;
      }>("/datasets"),
    claimLegacy: () =>
      request<{ claimed: number }>("/datasets/claim-legacy", {
        method: "POST",
      }),
    getStatus: (id: string) =>
      request<ProcessingStatus>(`/datasets/${id}/status`),
  },
  query: {
    submit: (datasetId: string, question: string, sessionId?: string) =>
      request<QueryResult | ClarificationResponse>("/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, question, sessionId }),
      }),
  },
  chat: {
    ensureSession: (datasetId?: string, title?: string, forceNew?: boolean) =>
      request<{ session: { _id: string; title: string } }>(
        "/chat/sessions/ensure",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datasetId, title, forceNew }),
        },
      ),
    listSessions: (datasetId?: string) => {
      const query = datasetId
        ? `?datasetId=${encodeURIComponent(datasetId)}`
        : "";
      return request<{
        sessions: Array<{
          _id: string;
          title: string;
          updatedAt: string;
          createdAt: string;
        }>;
      }>(`/chat/sessions${query}`);
    },
    renameSession: (sessionId: string, title: string) =>
      request<{
        session: {
          _id: string;
          title: string;
          updatedAt: string;
          createdAt: string;
        };
      }>(`/chat/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      }),
    deleteSession: (sessionId: string) =>
      request<{ success: boolean }>(`/chat/sessions/${sessionId}`, {
        method: "DELETE",
      }),
    getMessages: (sessionId: string) =>
      request<{
        session: { _id: string; title: string, datasetId?: string };
        messages: Array<{
          _id: string;
          question: string;
          result: QueryResult;
          createdAt: string;
        }>;
      }>(`/chat/sessions/${sessionId}/messages`),
  },
};
