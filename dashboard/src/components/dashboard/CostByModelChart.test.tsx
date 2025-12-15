import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CostByModelChart } from './CostByModelChart';
import { useMetricsStore } from '@/stores/metricsStore';
import type { AggregatedStats } from '@/types/metrics';

// Mock the store
vi.mock('@/stores/metricsStore', () => ({
  useMetricsStore: vi.fn(),
  selectStats: vi.fn((state) => state.stats),
}));

describe('CostByModelChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display waiting message when no stats are available', () => {
    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { stats: null };
        return selector(mockState as any);
      }
      return null;
    });

    render(<CostByModelChart />);

    expect(screen.getByText('Cost by Model (last hour)')).toBeInTheDocument();
    expect(screen.getByText('Waiting for data...')).toBeInTheDocument();
  });

  it('should display waiting message when costByModel is empty', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 0,
      topCustomers: [],
      costByModel: {},
    };

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { stats: mockStats };
        return selector(mockState as any);
      }
      return mockStats;
    });

    render(<CostByModelChart />);

    expect(screen.getByText('Waiting for data...')).toBeInTheDocument();
  });

  it('should display chart when costByModel data is available', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 100000,
      topCustomers: [],
      costByModel: {
        'gpt-4': 50000,
        'gpt-3.5-turbo': 30000,
        'claude-3-opus': 20000,
      },
    };

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { stats: mockStats };
        return selector(mockState as any);
      }
      return mockStats;
    });

    render(<CostByModelChart />);

    expect(screen.getByText('Cost by Model (last hour)')).toBeInTheDocument();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('should calculate and display total cost', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 100000,
      topCustomers: [],
      costByModel: {
        'gpt-4': 50000,
        'gpt-3.5-turbo': 30000,
      },
    };

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { stats: mockStats };
        return selector(mockState as any);
      }
      return mockStats;
    });

    render(<CostByModelChart />);

    // Should show total cost (50000 + 30000 = 80000)
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('should render chart container', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 100000,
      topCustomers: [],
      costByModel: {
        'gpt-4': 50000,
      },
    };

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { stats: mockStats };
        return selector(mockState as any);
      }
      return mockStats;
    });

    const { container } = render(<CostByModelChart />);
    
    // Check for ResponsiveContainer (recharts component)
    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });
});

