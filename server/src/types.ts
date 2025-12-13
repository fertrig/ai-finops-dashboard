export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';

export interface MetricUpdate {
  timestamp: string;
  tenantId: string;
  customerId: string;
  model: AIModel;
  metrics: {
    totalCalls: number;
    totalTokens: number;
    totalCost: number;
    avgLatencyMs: number;
  };
}

export interface MetricsResponse {
  metrics: MetricUpdate[];
  nextPollAfter: number;
}

export interface HistoryResponse {
  metrics: MetricUpdate[];
}

export interface CustomerConfig {
  customerId: string;
  model: AIModel;
  mockBaseCallsPerSecond: number;
}

export interface TenantConfig {
  tenantId: string;
  customers: CustomerConfig[];
}
