import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CostGauge } from './CostGauge';
import { useMetricsStore } from '@/stores/metricsStore';
import type { AggregatedStats } from '@/types/metrics';

// Mock the store
vi.mock('@/stores/metricsStore', () => ({
  useMetricsStore: vi.fn(),
  selectStats: vi.fn((state) => state.stats),
}));

describe('CostGauge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display cost per hour when stats are available', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 125000,
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

    render(<CostGauge />);

    expect(screen.getByText('Current Spend Rate (per hour)')).toBeInTheDocument();
    expect(screen.getByText('per hour')).toBeInTheDocument();
  });

  it('should display zero cost when stats are null', () => {
    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { stats: null };
        return selector(mockState as any);
      }
      return null;
    });

    render(<CostGauge />);

    expect(screen.getByText('Current Spend Rate (per hour)')).toBeInTheDocument();
    // Should show $0.00 when stats are null (appears in main display and min label)
    const zeroCostTexts = screen.getAllByText('$0.00');
    expect(zeroCostTexts.length).toBeGreaterThan(0);
    // Check that the main display shows $0.00
    const mainDisplay = screen.getByText('$0.00', { selector: '.text-3xl' });
    expect(mainDisplay).toBeInTheDocument();
  });

  it('should display min and max cost labels', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 50000,
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

    render(<CostGauge />);

    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('$250,000.00')).toBeInTheDocument();
  });

  it('should render SVG gauge', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 100000,
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

    const { container } = render(<CostGauge />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 110');
  });
});

