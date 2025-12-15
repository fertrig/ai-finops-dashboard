import { describe, it, expect } from 'vitest';
import {
  groupMetricsByInterval,
  filterOldMetrics,
  mergeAndProcessMetrics,
} from './metricsUtils';
import type { MetricUpdate } from '@/types/metrics';

function createMetric(timestamp: string, totalTokens: number): MetricUpdate {
  return {
    timestamp,
    tenantId: 'tenant-1',
    customerId: 'customer-1',
    model: 'gpt-4',
    metrics: {
      totalCalls: 1,
      totalTokens,
      totalCost: 0.01,
      avgLatencyMs: 100,
    },
  };
}

describe('groupMetricsByInterval', () => {
  describe('basic grouping', () => {
    it('should group metrics into time buckets', () => {
      const metrics = [
        createMetric('2025-01-01T00:00:00.000Z', 100),
        createMetric('2025-01-01T00:00:00.500Z', 200),
        createMetric('2025-01-01T00:00:01.000Z', 150),
      ];

      const result = groupMetricsByInterval(metrics, 1000);

      expect(result).toHaveLength(2);
      expect(result[0].tokens).toBe(300); // 100 + 200 in first second
      expect(result[1].tokens).toBe(150); // 150 in second second
    });

    it('should work with 2 second intervals', () => {
      const metrics = [
        createMetric('2025-01-01T00:00:00.000Z', 100),
        createMetric('2025-01-01T00:00:01.000Z', 200),
        createMetric('2025-01-01T00:00:02.000Z', 150),
        createMetric('2025-01-01T00:00:03.000Z', 250),
      ];

      const result = groupMetricsByInterval(metrics, 2000);

      expect(result).toHaveLength(2);
      expect(result[0].tokens).toBe(300); // 100 + 200
      expect(result[1].tokens).toBe(400); // 150 + 250
    });

    it('should work with 5 second intervals', () => {
      const metrics = [
        createMetric('2025-01-01T00:00:00.000Z', 100),
        createMetric('2025-01-01T00:00:02.000Z', 200),
        createMetric('2025-01-01T00:00:04.000Z', 150),
        createMetric('2025-01-01T00:00:05.000Z', 250),
      ];

      const result = groupMetricsByInterval(metrics, 5000);

      expect(result).toHaveLength(2);
      expect(result[0].tokens).toBe(450); // 100 + 200 + 150
      expect(result[1].tokens).toBe(250);
    });
  });

  describe('sorting', () => {
    it('should return results sorted by timestamp', () => {
      const metrics = [
        createMetric('2025-01-01T00:00:05.000Z', 300),
        createMetric('2025-01-01T00:00:00.000Z', 100),
        createMetric('2025-01-01T00:00:02.000Z', 200),
      ];

      const result = groupMetricsByInterval(metrics, 1000);

      expect(result[0].timestamp).toBeLessThan(result[1].timestamp);
      expect(result[1].timestamp).toBeLessThan(result[2].timestamp);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = groupMetricsByInterval([], 1000);
      expect(result).toEqual([]);
    });

    it('should handle single metric', () => {
      const metrics = [createMetric('2025-01-01T00:00:00.000Z', 100)];
      const result = groupMetricsByInterval(metrics, 1000);

      expect(result).toHaveLength(1);
      expect(result[0].tokens).toBe(100);
    });

    it('should handle metrics at exact bucket boundaries', () => {
      const metrics = [
        createMetric('2025-01-01T00:00:00.000Z', 100),
        createMetric('2025-01-01T00:00:01.000Z', 200),
        createMetric('2025-01-01T00:00:02.000Z', 300),
      ];

      const result = groupMetricsByInterval(metrics, 1000);

      expect(result).toHaveLength(3);
      expect(result[0].tokens).toBe(100);
      expect(result[1].tokens).toBe(200);
      expect(result[2].tokens).toBe(300);
    });
  });

  describe('timestamp alignment', () => {
    it('should align timestamps to interval boundaries', () => {
      const metrics = [
        createMetric('2025-01-01T00:00:00.500Z', 100),
        createMetric('2025-01-01T00:00:01.500Z', 200),
      ];

      const result = groupMetricsByInterval(metrics, 1000);

      // Timestamps should be aligned to second boundaries
      expect(result[0].timestamp % 1000).toBe(0);
      expect(result[1].timestamp % 1000).toBe(0);
    });
  });
});

describe('filterOldMetrics', () => {
  const NOW = new Date('2025-01-01T00:10:00.000Z').getTime();

  it('should keep metrics within max age', () => {
    const metrics = [
      createMetric('2025-01-01T00:09:00.000Z', 100), // 1 minute ago
      createMetric('2025-01-01T00:08:00.000Z', 200), // 2 minutes ago
    ];

    const result = filterOldMetrics(metrics, 5 * 60 * 1000, NOW);

    expect(result).toHaveLength(2);
  });

  it('should filter out metrics older than max age', () => {
    const metrics = [
      createMetric('2025-01-01T00:09:00.000Z', 100), // 1 minute ago - keep
      createMetric('2025-01-01T00:04:00.000Z', 200), // 6 minutes ago - filter
    ];

    const result = filterOldMetrics(metrics, 5 * 60 * 1000, NOW);

    expect(result).toHaveLength(1);
    expect(result[0].metrics.totalTokens).toBe(100);
  });

  it('should filter out metrics at exact boundary', () => {
    const metrics = [
      createMetric('2025-01-01T00:05:00.000Z', 100), // exactly 5 minutes ago
    ];

    const result = filterOldMetrics(metrics, 5 * 60 * 1000, NOW);

    // Exactly at boundary should be filtered (uses > not >=)
    expect(result).toHaveLength(0);
  });

  it('should return empty array for empty input', () => {
    const result = filterOldMetrics([], 5 * 60 * 1000, NOW);
    expect(result).toEqual([]);
  });
});

describe('mergeAndProcessMetrics', () => {
  const NOW = new Date('2025-01-01T00:10:00.000Z').getTime();
  const MAX_AGE = 5 * 60 * 1000;

  it('should merge existing and new metrics', () => {
    const existing = [createMetric('2025-01-01T00:09:00.000Z', 100)];
    const newMetrics = [createMetric('2025-01-01T00:09:30.000Z', 200)];

    const result = mergeAndProcessMetrics(existing, newMetrics, MAX_AGE, NOW);

    expect(result).toHaveLength(2);
  });

  it('should filter out old metrics after merge', () => {
    const existing = [
      createMetric('2025-01-01T00:04:00.000Z', 100), // too old
    ];
    const newMetrics = [
      createMetric('2025-01-01T00:09:30.000Z', 200), // fresh
    ];

    const result = mergeAndProcessMetrics(existing, newMetrics, MAX_AGE, NOW);

    expect(result).toHaveLength(1);
    expect(result[0].metrics.totalTokens).toBe(200);
  });

  it('should sort by timestamp ascending', () => {
    const existing = [createMetric('2025-01-01T00:09:30.000Z', 200)];
    const newMetrics = [createMetric('2025-01-01T00:09:00.000Z', 100)];

    const result = mergeAndProcessMetrics(existing, newMetrics, MAX_AGE, NOW);

    expect(result[0].metrics.totalTokens).toBe(100); // older first
    expect(result[1].metrics.totalTokens).toBe(200);
  });

  it('should handle empty existing metrics', () => {
    const newMetrics = [createMetric('2025-01-01T00:09:30.000Z', 200)];

    const result = mergeAndProcessMetrics([], newMetrics, MAX_AGE, NOW);

    expect(result).toHaveLength(1);
  });

  it('should handle empty new metrics', () => {
    const existing = [createMetric('2025-01-01T00:09:00.000Z', 100)];

    const result = mergeAndProcessMetrics(existing, [], MAX_AGE, NOW);

    expect(result).toHaveLength(1);
  });

  it('should handle both empty', () => {
    const result = mergeAndProcessMetrics([], [], MAX_AGE, NOW);
    expect(result).toEqual([]);
  });
});
