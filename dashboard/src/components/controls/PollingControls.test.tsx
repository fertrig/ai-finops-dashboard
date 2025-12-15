import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PollingControls } from './PollingControls';
import { useSettingsStore } from '@/stores/settingsStore';
import type { PollingInterval } from '@/types/metrics';

// Mock the store
vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: vi.fn(),
  selectPollingInterval: vi.fn((state) => state.pollingInterval),
  selectIsPollingEnabled: vi.fn((state) => state.isPollingEnabled),
}));

describe('PollingControls', () => {
  const mockSetPollingInterval = vi.fn();
  const mockTogglePolling = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMockStore = (pollingInterval: PollingInterval, isPollingEnabled: boolean) => {
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      const state = {
        pollingInterval,
        isPollingEnabled,
        setPollingInterval: mockSetPollingInterval,
        togglePolling: mockTogglePolling,
      };
      return selector ? selector(state as any) : state;
    });
  };

  it('should render polling controls with current interval', () => {
    setupMockStore(2000, true);
    render(<PollingControls />);

    expect(screen.getByText('Interval:')).toBeInTheDocument();
    expect(screen.getByText('2s')).toBeInTheDocument();
  });

  it('should display Pause button when polling is enabled', () => {
    setupMockStore(2000, true);
    render(<PollingControls />);

    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('should display Resume button when polling is disabled', () => {
    setupMockStore(2000, false);
    render(<PollingControls />);

    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('should call togglePolling when pause/resume button is clicked', async () => {
    setupMockStore(2000, true);
    const user = userEvent.setup();
    render(<PollingControls />);

    const button = screen.getByText('Pause');
    await user.click(button);

    expect(mockTogglePolling).toHaveBeenCalledTimes(1);
  });

  it('should display current interval value', () => {
    setupMockStore(2000, true);
    render(<PollingControls />);

    // Check that the current interval is displayed
    expect(screen.getByText('2s')).toBeInTheDocument();
  });

  it('should render interval select with correct value', () => {
    setupMockStore(5000, true);
    render(<PollingControls />);

    // The select should show the current interval
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toBeInTheDocument();
    expect(selectTrigger).toHaveTextContent('5s');
  });
});

