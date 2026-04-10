import { DatasetMeta, ProcessingStatus, QueryResult, ClarificationResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(res.status, error.error || res.statusText);
  }
  return res.json();
}

export const api = {
  datasets: {
    upload: async (file: File, name?: string): Promise<{ datasetId: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      if (name) formData.append('name', name);
      
      return request<{ datasetId: string }>('/datasets/upload', {
        method: 'POST',
        body: formData,
      });
    },
    get: (id: string) => request<DatasetMeta>(`/datasets/${id}`),
    getStatus: (id: string) => request<ProcessingStatus>(`/datasets/${id}/status`),
  },
  query: {
    submit: (datasetId: string, question: string) => 
      request<QueryResult | ClarificationResponse>('/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasetId, question }),
      }),
  }
};
