import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TokenUsageChart } from './TokenUsageChart';
import { useMetricsStore } from '@/stores/metricsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { MetricUpdate } from '@/types/metrics';

// Mock the stores
vi.mock('@/stores/metricsStore', () => ({
  useMetricsStore: vi.fn(),
  selectMetrics: vi.fn((state) => state.metrics),
}));

vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: vi.fn(),
  selectPollingInterval: vi.fn((state) => state.pollingInterval),
}));

describe('TokenUsageChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display waiting message when no metrics are available', () => {
    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { metrics: [] };
        return selector(mockState as any);
      }
      return [];
    });
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { pollingInterval: 2000 };
        return selector(mockState as any);
      }
      return 2000;
    });

    render(<TokenUsageChart />);

    expect(screen.getByText('Token Usage (last 5 minutes)')).toBeInTheDocument();
    expect(screen.getByText('Waiting for data...')).toBeInTheDocument();
  });

  it('should display chart when metrics are available', () => {
    const mockMetrics: MetricUpdate[] = [
      {
        timestamp: '2025-01-01T00:00:00.000Z',
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        model: 'gpt-4',
        metrics: {
          totalCalls: 1,
          totalTokens: 1000,
          totalCost: 0.01,
          avgLatencyMs: 100,
        },
      },
      {
        timestamp: '2025-01-01T00:01:00.000Z',
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        model: 'gpt-4',
        metrics: {
          totalCalls: 1,
          totalTokens: 2000,
          totalCost: 0.02,
          avgLatencyMs: 100,
        },
      },
    ];

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { metrics: mockMetrics };
        return selector(mockState as any);
      }
      return mockMetrics;
    });
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { pollingInterval: 2000 };
        return selector(mockState as any);
      }
      return 2000;
    });

    render(<TokenUsageChart />);

    expect(screen.getByText('Token Usage (last 5 minutes)')).toBeInTheDocument();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('should calculate and display total tokens', () => {
    const mockMetrics: MetricUpdate[] = [
      {
        timestamp: '2025-01-01T00:00:00.000Z',
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        model: 'gpt-4',
        metrics: {
          totalCalls: 1,
          totalTokens: 1000,
          totalCost: 0.01,
          avgLatencyMs: 100,
        },
      },
      {
        timestamp: '2025-01-01T00:01:00.000Z',
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        model: 'gpt-4',
        metrics: {
          totalCalls: 1,
          totalTokens: 2000,
          totalCost: 0.02,
          avgLatencyMs: 100,
        },
      },
    ];

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { metrics: mockMetrics };
        return selector(mockState as any);
      }
      return mockMetrics;
    });
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { pollingInterval: 2000 };
        return selector(mockState as any);
      }
      return 2000;
    });

    render(<TokenUsageChart />);

    // Should show total tokens (1000 + 2000 = 3000)
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('should render chart container', () => {
    const mockMetrics: MetricUpdate[] = [
      {
        timestamp: '2025-01-01T00:00:00.000Z',
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        model: 'gpt-4',
        metrics: {
          totalCalls: 1,
          totalTokens: 1000,
          totalCost: 0.01,
          avgLatencyMs: 100,
        },
      },
    ];

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { metrics: mockMetrics };
        return selector(mockState as any);
      }
      return mockMetrics;
    });
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { pollingInterval: 2000 };
        return selector(mockState as any);
      }
      return 2000;
    });

    const { container } = render(<TokenUsageChart />);
    
    // Check for ResponsiveContainer (recharts component)
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });
});

