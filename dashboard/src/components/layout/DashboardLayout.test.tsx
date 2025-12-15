import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardLayout } from './DashboardLayout';
import { useSettingsStore } from '@/stores/settingsStore';
import type { ConnectionStatus, PollingInterval } from '@/types/metrics';

// Mock the stores
vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: vi.fn(),
  selectConnectionStatus: vi.fn((state) => state.connectionStatus),
  selectPollingInterval: vi.fn((state) => state.pollingInterval),
  selectIsPollingEnabled: vi.fn((state) => state.isPollingEnabled),
  calculateBackoffDelay: vi.fn(),
}));

describe('DashboardLayout - Integration Tests', () => {
  const mockSetPollingInterval = vi.fn();
  const mockTogglePolling = vi.fn();
  const mockSetConnectionStatus = vi.fn();

  let currentState: {
    pollingInterval: PollingInterval;
    isPollingEnabled: boolean;
    connectionStatus: ConnectionStatus;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    currentState = {
      pollingInterval: 2000,
      isPollingEnabled: true,
      connectionStatus: 'disconnected',
    };
  });

  const setupMockStore = () => {
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      const state = {
        ...currentState,
        setPollingInterval: mockSetPollingInterval,
        togglePolling: () => {
          currentState.isPollingEnabled = !currentState.isPollingEnabled;
          mockTogglePolling();
        },
        setConnectionStatus: mockSetConnectionStatus,
      };
      return selector ? selector(state as any) : state;
    });
  };

  it('should render dashboard layout with all controls', () => {
    setupMockStore();
    render(
      <DashboardLayout>
        <div>Dashboard Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('AI FinOps Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Real-time AI usage and cost monitoring')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Interval:')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('should display initial polling and connection state', () => {
    setupMockStore();
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Initial state: polling enabled, disconnected
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('2s')).toBeInTheDocument();
  });

  it('should allow user to pause and resume polling - full interaction flow', async () => {
    setupMockStore();
    const user = userEvent.setup();
    
    const { rerender } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Step 1: User sees polling is enabled
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.queryByText('Resume')).not.toBeInTheDocument();

    // Step 2: User clicks pause button
    const pauseButton = screen.getByText('Pause');
    await user.click(pauseButton);

    // Step 3: Verify togglePolling was called
    expect(mockTogglePolling).toHaveBeenCalledTimes(1);

    // Step 4: Update state to reflect paused state and re-render
    currentState.isPollingEnabled = false;
    setupMockStore();
    rerender(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Step 5: User sees Resume button (polling is paused)
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.queryByText('Pause')).not.toBeInTheDocument();

    // Step 6: User clicks resume button
    const resumeButton = screen.getByText('Resume');
    await user.click(resumeButton);

    // Step 7: Verify togglePolling was called again
    expect(mockTogglePolling).toHaveBeenCalledTimes(2);

    // Step 8: Update state back to enabled and re-render
    currentState.isPollingEnabled = true;
    setupMockStore();
    rerender(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Step 9: User sees Pause button again (polling resumed)
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.queryByText('Resume')).not.toBeInTheDocument();
  });

  it('should display connection status changes alongside polling controls', () => {
    // Test that both components work together and reflect store state
    currentState.connectionStatus = 'connected';
    setupMockStore();
    
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Both components should reflect their respective store values
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('2s')).toBeInTheDocument();
  });

  it('should show different connection states with polling controls', () => {
    const states: ConnectionStatus[] = ['connecting', 'error', 'connected', 'disconnected'];
    
    states.forEach((status) => {
      currentState.connectionStatus = status;
      setupMockStore();
      
      const { unmount } = render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      // ConnectionStatus should show the current status
      const statusLabels: Record<ConnectionStatus, string> = {
        connecting: 'Connecting...',
        error: 'Error',
        connected: 'Connected',
        disconnected: 'Disconnected',
      };
      expect(screen.getByText(statusLabels[status])).toBeInTheDocument();
      
      // PollingControls should still be visible and functional
      expect(screen.getByText('Interval:')).toBeInTheDocument();
      
      unmount();
    });
  });
});

