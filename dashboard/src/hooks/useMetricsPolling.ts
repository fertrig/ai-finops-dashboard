import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMetrics, fetchStats } from '@/api/metricsApi';
import { useMetricsStore } from '@/stores/metricsStore';
import { useSettingsStore, calculateBackoffDelay } from '@/stores/settingsStore';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function useMetricsPolling() {
  const queryClient = useQueryClient();
  const lastFetchTime = useRef<number>(Date.now() - FIVE_MINUTES_MS);

  const {
    pollingInterval,
    isPollingEnabled,
    errorCount,
    setConnectionStatus,
    incrementErrorCount,
    resetErrorCount,
  } = useSettingsStore();

  const { addMetrics, setStats } = useMetricsStore();

  // Calculate effective polling interval with backoff
  const effectiveInterval = errorCount > 0
    ? calculateBackoffDelay(errorCount, pollingInterval)
    : pollingInterval;

  // Metrics polling query
  const metricsQuery = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const since = lastFetchTime.current;
      const response = await fetchMetrics(since);
      // Update timestamp immediately after successful fetch
      lastFetchTime.current = Date.now();
      return response;
    },
    enabled: isPollingEnabled,
    refetchInterval: effectiveInterval,
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 0,
    gcTime: 0, // Don't cache old results
  });

  // Stats query (less frequent)
  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    enabled: isPollingEnabled,
    refetchInterval: Math.max(effectiveInterval * 2, 5000),
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 0,
  });

  // Handle metrics data updates
  useEffect(() => {
    if (metricsQuery.data) {
      addMetrics(metricsQuery.data.metrics);
      resetErrorCount();
      setConnectionStatus('connected');
    }
  }, [metricsQuery.data, addMetrics, resetErrorCount, setConnectionStatus]);

  // Handle stats data updates
  useEffect(() => {
    if (statsQuery.data) {
      setStats(statsQuery.data);
    }
  }, [statsQuery.data, setStats]);

  // Handle errors
  useEffect(() => {
    if (metricsQuery.error || statsQuery.error) {
      incrementErrorCount();
      setConnectionStatus('error');
    }
  }, [metricsQuery.error, statsQuery.error, incrementErrorCount, setConnectionStatus]);

  // Handle loading state (only on initial load, not during polling)
  useEffect(() => {
    if (metricsQuery.isFetching && !metricsQuery.data && !metricsQuery.error) {
      setConnectionStatus('connecting');
    }
  }, [metricsQuery.isFetching, metricsQuery.data, metricsQuery.error, setConnectionStatus]);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause polling when tab is hidden
        queryClient.cancelQueries({ queryKey: ['metrics'] });
        queryClient.cancelQueries({ queryKey: ['stats'] });
      } else {
        // Resume polling when tab becomes visible
        if (isPollingEnabled) {
          queryClient.invalidateQueries({ queryKey: ['metrics'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient, isPollingEnabled, pollingInterval]);

  const refetch = useCallback(() => {
    lastFetchTime.current = Date.now() - pollingInterval;
    queryClient.invalidateQueries({ queryKey: ['metrics'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  }, [queryClient, pollingInterval]);

  return {
    isLoading: metricsQuery.isLoading || statsQuery.isLoading,
    isFetching: metricsQuery.isFetching || statsQuery.isFetching,
    error: metricsQuery.error || statsQuery.error,
    refetch,
  };
}
