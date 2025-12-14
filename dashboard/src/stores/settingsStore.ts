import { create } from 'zustand';
import type { PollingInterval, ConnectionStatus } from '@/types/metrics';

interface SettingsState {
  pollingInterval: PollingInterval;
  isPollingEnabled: boolean;
  connectionStatus: ConnectionStatus;
  errorCount: number;

  // Actions
  setPollingInterval: (interval: PollingInterval) => void;
  togglePolling: () => void;
  setPollingEnabled: (enabled: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  incrementErrorCount: () => void;
  resetErrorCount: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  pollingInterval: 2000,
  isPollingEnabled: true,
  connectionStatus: 'disconnected',
  errorCount: 0,

  setPollingInterval: (interval) => {
    set({ pollingInterval: interval });
  },

  togglePolling: () => {
    set((state) => ({ isPollingEnabled: !state.isPollingEnabled }));
  },

  setPollingEnabled: (enabled) => {
    set({ isPollingEnabled: enabled });
  },

  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },

  incrementErrorCount: () => {
    set((state) => ({ errorCount: state.errorCount + 1 }));
  },

  resetErrorCount: () => {
    set({ errorCount: 0 });
  },
}));

// Selectors
export const selectPollingInterval = (state: SettingsState) => state.pollingInterval;
export const selectIsPollingEnabled = (state: SettingsState) => state.isPollingEnabled;
export const selectConnectionStatus = (state: SettingsState) => state.connectionStatus;
export const selectErrorCount = (state: SettingsState) => state.errorCount;

// Calculate backoff delay based on error count
export function calculateBackoffDelay(errorCount: number, baseInterval: number): number {
  const maxBackoff = 16000; // 16 seconds max
  const backoffMultiplier = Math.pow(2, Math.min(errorCount, 4));
  return Math.min(baseInterval * backoffMultiplier, maxBackoff);
}
