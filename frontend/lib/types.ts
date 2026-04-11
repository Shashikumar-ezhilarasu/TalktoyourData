export type IntentType = 'COMPARE' | 'BREAKDOWN' | 'SUMMARY' | 'ANOMALY' | 'GENERAL';

export interface ColumnProfile {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean' | 'category';
  nullPct: number;
  uniqueCount: number;
  sampleValues: any[];
  likelyMetric?: boolean;
  likelyDimension?: boolean;
}

export interface DatasetMeta {
  _id: string;
  name: string;
  filename: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  processingStatus: 'pending' | 'processing' | 'ready' | 'error'];
  columnProfiles: ColumnProfile[];
  piiColumnsRedacted: string[];
  uploadedAt: string;
}

export interface PipelineEvent {
  event: 'intent_classified' | 'columns_resolved' | 'stats_computed' | 'agent_running' | 'insight_ready' | 'pipeline_update';
  data: any;
  timestamp: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'comparison' | 'scatter';
  labels: string[];
  values: number[];
  secondaryValues?: number[];
}

export interface QueryResult {
  _id: string;
  intent: IntentType;
  headline: string;
  metricName: string;
  metricValue: number;
  changeValue: number;
  changeDirection: 'up' | 'down' | 'flat' | 'none';
  explanation: string;
  chartData: ChartData;
  anomalyDetected: boolean;
  anomalyDetails?: {
    anomalyCount: number;
    worstValue: number;
    expectedRange: { low: number; high: number };
    zScore: number;
  };
  topContributor?: {
    dimension: string;
    value: string;
    metricValue: number;
    impact: number;
  };
  suggestedFollowUps: string[];
  sourceSummary: string;
  confidence: number;
  durationMs: number;
  createdAt: string;
}

export interface ClarificationResponse {
  type: 'CLARIFICATION';
  question: string;
  options?: string[];
}

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'ready' | 'error';
  progress?: number;
  errorMessage?: string;
}
