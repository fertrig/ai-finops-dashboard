import { create } from 'zustand';
import type { MetricUpdate, AggregatedStats } from '@/types/metrics';

const MAX_METRICS_AGE_MS = 5 * 60 * 1000; // 5 minutes
const BUFFER_FLUSH_INTERVAL_MS = 500; // Flush buffer every 500ms to smooth updates

// Buffer for incoming metrics (outside store to avoid re-renders)
let metricsBuffer: MetricUpdate[] = [];
let flushScheduled = false;
let storeSetFn: ((fn: (state: MetricsState) => Partial<MetricsState>) => void) | null = null;

function scheduleFlush() {
  if (flushScheduled || !storeSetFn) return;
  flushScheduled = true;

  // Use requestAnimationFrame for smooth visual updates
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (metricsBuffer.length > 0 && storeSetFn) {
        const metricsToAdd = metricsBuffer;
        metricsBuffer = [];
        flushScheduled = false;

        const now = Date.now();
        const cutoffTime = now - MAX_METRICS_AGE_MS;

        storeSetFn((state) => {
          // Combine existing and buffered metrics
          const allMetrics = [...state.metrics, ...metricsToAdd];

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
      } else {
        flushScheduled = false;
      }
    }, BUFFER_FLUSH_INTERVAL_MS);
  });
}

interface MetricsState {
  metrics: MetricUpdate[];
  stats: AggregatedStats | null;
  lastUpdateTime: number | null;

  // Actions
  addMetrics: (newMetrics: MetricUpdate[]) => void;
  setStats: (stats: AggregatedStats) => void;
  clearMetrics: () => void;
}

export const useMetricsStore = create<MetricsState>((set) => {
  // Store reference to set function for buffer flush
  storeSetFn = set;

  return {
    metrics: [],
    stats: null,
    lastUpdateTime: null,

    addMetrics: (newMetrics) => {
      // Add to buffer instead of updating store directly
      metricsBuffer = metricsBuffer.concat(newMetrics);
      scheduleFlush();
    },

    setStats: (stats) => {
      set({ stats });
    },

    clearMetrics: () => {
      metricsBuffer = [];
      set({ metrics: [], stats: null, lastUpdateTime: null });
    },
  };
});

// Simple selectors (these are stable)
export const selectMetrics = (state: MetricsState) => state.metrics;
export const selectStats = (state: MetricsState) => state.stats;
export const selectLastUpdateTime = (state: MetricsState) => state.lastUpdateTime;
