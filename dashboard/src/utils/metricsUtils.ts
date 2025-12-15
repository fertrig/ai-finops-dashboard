import type { MetricUpdate } from '@/types/metrics';

export interface TimeSeriesPoint {
  timestamp: number;
  tokens: number;
}

/**
 * Groups metrics by time interval and aggregates token counts
 */
export function groupMetricsByInterval(
  metrics: MetricUpdate[],
  intervalMs: number
): TimeSeriesPoint[] {
  const grouped = new Map<number, number>();

  metrics.forEach((m) => {
    const ts = Math.floor(new Date(m.timestamp).getTime() / intervalMs) * intervalMs;
    const current = grouped.get(ts) || 0;
    grouped.set(ts, current + m.metrics.totalTokens);
  });

  return Array.from(grouped.entries())
    .map(([timestamp, tokens]) => ({ timestamp, tokens }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Filters out metrics older than the specified age
 */
export function filterOldMetrics(
  metrics: MetricUpdate[],
  maxAgeMs: number,
  now: number = Date.now()
): MetricUpdate[] {
  const cutoffTime = now - maxAgeMs;
  return metrics.filter((m) => new Date(m.timestamp).getTime() > cutoffTime);
}

/**
 * Merges new metrics with existing ones, removes old, and sorts by timestamp
 */
export function mergeAndProcessMetrics(
  existing: MetricUpdate[],
  newMetrics: MetricUpdate[],
  maxAgeMs: number,
  now: number = Date.now()
): MetricUpdate[] {
  const allMetrics = [...existing, ...newMetrics];
  const filtered = filterOldMetrics(allMetrics, maxAgeMs, now);

  // Sort by timestamp
  filtered.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return filtered;
}
