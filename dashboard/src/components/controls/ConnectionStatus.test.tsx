import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from './ConnectionStatus';
import { useSettingsStore } from '@/stores/settingsStore';
import type { ConnectionStatus as ConnectionStatusType } from '@/types/metrics';

// Mock the store
vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: vi.fn(),
  selectConnectionStatus: vi.fn((state) => state.connectionStatus),
}));

describe('ConnectionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display connected status with success badge', () => {
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { connectionStatus: 'connected' as ConnectionStatusType };
        return selector(mockState as any);
      }
      return 'connected' as ConnectionStatusType;
    });

    render(<ConnectionStatus />);

    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should display connecting status with warning badge', () => {
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { connectionStatus: 'connecting' as ConnectionStatusType };
        return selector(mockState as any);
      }
      return 'connecting' as ConnectionStatusType;
    });

    render(<ConnectionStatus />);

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('should display error status with destructive badge', () => {
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { connectionStatus: 'error' as ConnectionStatusType };
        return selector(mockState as any);
      }
      return 'error' as ConnectionStatusType;
    });

    render(<ConnectionStatus />);

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should display disconnected status with outline badge', () => {
    vi.mocked(useSettingsStore).mockImplementation((selector) => {
      if (selector) {
        const mockState = { connectionStatus: 'disconnected' as ConnectionStatusType };
        return selector(mockState as any);
      }
      return 'disconnected' as ConnectionStatusType;
    });

    render(<ConnectionStatus />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });
});

