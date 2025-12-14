import type { MetricsResponse, AggregatedStats } from '@/types/metrics';

const API_BASE_URL = '/api';
const DEFAULT_TIMEOUT_MS = 5000; // 5 second timeout

async function fetchWithTimeout<T>(
  url: string,
): Promise<T> {

  const response = await fetch(url, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function fetchMetrics(sinceTimestamp?: number): Promise<MetricsResponse> {
  const params = new URLSearchParams();
  if (sinceTimestamp) {
    params.set('since', sinceTimestamp.toString());
  }

  const url = `${API_BASE_URL}/metrics${params.toString() ? `?${params}` : ''}`;
  return fetchWithTimeout<MetricsResponse>(url);
}

export async function fetchStats(): Promise<AggregatedStats> {
  return fetchWithTimeout<AggregatedStats>(`${API_BASE_URL}/stats`);
}

export async function checkHealth(): Promise<{ status: string; timestamp: string; uptime: number }> {
  return fetchWithTimeout(`${API_BASE_URL}/health`);
}
