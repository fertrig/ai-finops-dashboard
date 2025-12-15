import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopCustomersTable } from './TopCustomersTable';
import { useMetricsStore } from '@/stores/metricsStore';
import type { AggregatedStats } from '@/types/metrics';

// Mock the store
vi.mock('@/stores/metricsStore', () => ({
  useMetricsStore: vi.fn(),
  selectStats: vi.fn((state) => state.stats),
}));

describe('TopCustomersTable', () => {
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

    render(<TopCustomersTable />);

    expect(screen.getByText('Top 10 Customers by Spend (last hour)')).toBeInTheDocument();
    expect(screen.getByText('Waiting for data...')).toBeInTheDocument();
  });

  it('should display waiting message when topCustomers is empty', () => {
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

    render(<TopCustomersTable />);

    expect(screen.getByText('Waiting for data...')).toBeInTheDocument();
  });

  it('should display top customers in a table', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 100000,
      topCustomers: [
        { customerId: 'tenant-1-customer-1', totalCost: 50000 },
        { customerId: 'tenant-1-customer-2', totalCost: 30000 },
        { customerId: 'tenant-2-customer-1', totalCost: 20000 },
      ],
      costByModel: {},
    };

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { stats: mockStats };
        return selector(mockState as any);
      }
      return mockStats;
    });

    render(<TopCustomersTable />);

    expect(screen.getByText('Top 10 Customers by Spend (last hour)')).toBeInTheDocument();
    expect(screen.getByText('Customer ID (tenant-customer)')).toBeInTheDocument();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();

    expect(screen.getByText('tenant-1-customer-1')).toBeInTheDocument();
    expect(screen.getByText('tenant-1-customer-2')).toBeInTheDocument();
    expect(screen.getByText('tenant-2-customer-1')).toBeInTheDocument();
  });

  it('should display customer rankings', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 100000,
      topCustomers: [
        { customerId: 'tenant-1-customer-1', totalCost: 50000 },
        { customerId: 'tenant-1-customer-2', totalCost: 30000 },
      ],
      costByModel: {},
    };

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { stats: mockStats };
        return selector(mockState as any);
      }
      return mockStats;
    });

    render(<TopCustomersTable />);

    // Check for ranking numbers
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(2); // Header + data rows
  });

  it('should limit display to top 10 customers', () => {
    const mockStats: AggregatedStats = {
      totalCostPerHour: 100000,
      topCustomers: Array.from({ length: 15 }, (_, i) => ({
        customerId: `tenant-1-customer-${i + 1}`,
        totalCost: 10000 - i * 100,
      })),
      costByModel: {},
    };

    vi.mocked(useMetricsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { stats: mockStats };
        return selector(mockState as any);
      }
      return mockStats;
    });

    render(<TopCustomersTable />);

    // Should only show 10 customers
    const customerRows = screen.getAllByText(/tenant-1-customer-/);
    expect(customerRows.length).toBe(10);
  });
});

