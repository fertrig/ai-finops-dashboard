import { create } from 'zustand';
import type { MetricUpdate, AggregatedStats } from '@/types/metrics';

const MAX_METRICS_AGE_MS = 5 * 60 * 1000; // 5 minutes

interface MetricsState {
  metrics: MetricUpdate[];
  stats: AggregatedStats | null;
  lastUpdateTime: number | null;

  // Actions
  addMetrics: (newMetrics: MetricUpdate[]) => void;
  setStats: (stats: AggregatedStats) => void;
  clearMetrics: () => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  metrics: [],
  stats: null,
  lastUpdateTime: null,

  addMetrics: (newMetrics) => {
    const now = Date.now();
    const cutoffTime = now - MAX_METRICS_AGE_MS;

    set((state) => {
      // Combine existing and new metrics
      const allMetrics = [...state.metrics, ...newMetrics];

      // Remove old metrics (older than 5 minutes)
      const filteredMetrics = allMetrics.filter(
        (m) => new Date(m.timestamp).getTime() > cutoffTime
      );

      // Sort by timestamp
      filteredMetrics.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return {
        metrics: filteredMetrics,
        lastUpdateTime: now,
      };
    });
  },

  setStats: (stats) => {
    set({ stats });
  },

  clearMetrics: () => {
    set({ metrics: [], stats: null, lastUpdateTime: null });
  },
}));

// Simple selectors (these are stable)
export const selectMetrics = (state: MetricsState) => state.metrics;
export const selectStats = (state: MetricsState) => state.stats;
export const selectLastUpdateTime = (state: MetricsState) => state.lastUpdateTime;
