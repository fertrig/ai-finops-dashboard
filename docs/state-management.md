# State Management Architecture

## Overview

The dashboard uses a hybrid state management approach combining **Zustand** for client state and **React Query** for server state.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         State Management Layers                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Server State (React Query)                  │   │
│  │  • API responses (metrics, stats)                                │   │
│  │  • Polling intervals                                             │   │
│  │  • Request caching                                               │   │
│  │  • Error/loading states                                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Client State (Zustand)                      │   │
│  │  ┌─────────────────────┐    ┌─────────────────────────────────┐  │   │
│  │  │    metricsStore     │    │        settingsStore            │  │   │
│  │  │  • metrics[]        │    │  • pollingInterval              │  │   │
│  │  │  • stats            │    │  • isPollingEnabled             │  │   │
│  │  │  • lastUpdateTime   │    │  • connectionStatus             │  │   │
│  │  │  • buffer (external)│    │  • errorCount                   │  │   │
│  │  └─────────────────────┘    └─────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Component State (React)                     │   │
│  │  • Local UI state (hover, focus)                                 │   │
│  │  • Derived data via useMemo                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Why This Architecture?

| Concern | Solution | Rationale |
|---------|----------|-----------|
| Server data fetching | React Query | Built-in polling, caching, error handling |
| Accumulated metrics | Zustand | Need to buffer and aggregate across polls |
| UI settings | Zustand | Persists across component mounts |
| Derived data | useMemo | Computed in components, not stored |

## Zustand Stores

### metricsStore

**Purpose**: Store and buffer incoming metrics data.

```typescript
interface MetricsState {
  metrics: MetricUpdate[];      // Last 5 minutes of metrics
  stats: AggregatedStats | null; // Server-computed statistics
  lastUpdateTime: number | null; // Timestamp of last update

  // Actions
  addMetrics: (newMetrics: MetricUpdate[]) => void;
  setStats: (stats: AggregatedStats) => void;
  clearMetrics: () => void;
}
```

**Key Features**:

1. **Client-side Buffering**
   ```
   Incoming data → Buffer (external) → Flush every 500ms → Store update
   ```
   - Prevents bursty re-renders
   - Uses `requestAnimationFrame` for smooth updates

2. **Automatic Cleanup**
   - Removes metrics older than 5 minutes
   - Sorts by timestamp on each update

3. **Selectors** (prevent unnecessary re-renders)
   ```typescript
   export const selectMetrics = (state: MetricsState) => state.metrics;
   export const selectStats = (state: MetricsState) => state.stats;
   ```

### settingsStore

**Purpose**: Store UI preferences and connection state.

```typescript
interface SettingsState {
  pollingInterval: PollingInterval;  // 1000 | 2000 | 5000 | 10000
  isPollingEnabled: boolean;
  connectionStatus: ConnectionStatus; // connected | connecting | error | disconnected
  errorCount: number;                 // For exponential backoff

  // Actions
  setPollingInterval: (interval: PollingInterval) => void;
  togglePolling: () => void;
  setPollingEnabled: (enabled: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  incrementErrorCount: () => void;
  resetErrorCount: () => void;
}
```

**Key Features**:

1. **Exponential Backoff**
   ```typescript
   function calculateBackoffDelay(errorCount: number, baseInterval: number): number {
     const maxBackoff = 16000;
     const backoffMultiplier = Math.pow(2, Math.min(errorCount, 4));
     return Math.min(baseInterval * backoffMultiplier, maxBackoff);
   }
   ```
   Backoff sequence: 2s → 4s → 8s → 16s (max)

2. **Connection Status Tracking**
   - `disconnected`: Initial state
   - `connecting`: First fetch in progress
   - `connected`: Successful fetch
   - `error`: Fetch failed

## React Query Integration

### useMetricsPolling Hook

**Purpose**: Orchestrate data fetching and store updates.

```typescript
function useMetricsPolling() {
  // Metrics polling
  const metricsQuery = useQuery({
    queryKey: ['metrics'],
    queryFn: () => fetchMetrics(lastFetchTime.current),
    enabled: isPollingEnabled,
    refetchInterval: effectiveInterval,  // With backoff
    refetchIntervalInBackground: false,  // Pause when tab hidden
    retry: false,                         // Manual retry via backoff
    gcTime: 0,                            // Don't cache old results
  });

  // Stats polling (less frequent)
  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: Math.max(effectiveInterval * 2, 5000),
  });

  // Sync to Zustand stores via useEffect
  useEffect(() => {
    if (metricsQuery.data) {
      addMetrics(metricsQuery.data.metrics);
      resetErrorCount();
      setConnectionStatus('connected');
    }
  }, [metricsQuery.data]);
}
```

### Data Flow Sequence

```
1. React Query triggers fetch (based on refetchInterval)
         │
         ▼
2. fetchMetrics(since) → Server API
         │
         ▼
3. Response received by React Query
         │
         ▼
4. useEffect detects metricsQuery.data change
         │
         ▼
5. addMetrics() called → Data added to buffer
         │
         ▼
6. scheduleFlush() → requestAnimationFrame + setTimeout(500ms)
         │
         ▼
7. Buffer flushed → Zustand store updated
         │
         ▼
8. Components re-render (via selectors)
```

## Performance Optimizations

### 1. Buffered Updates

```
Without buffering:
  Fetch 1 → render → Fetch 2 → render → Fetch 3 → render
  (Multiple rapid re-renders)

With buffering:
  Fetch 1 → buffer
  Fetch 2 → buffer     → flush → single render
  Fetch 3 → buffer
```

### 2. Selector-based Subscriptions

```typescript
// Only re-renders when stats changes
const stats = useMetricsStore(selectStats);

// Only re-renders when connectionStatus changes
const status = useSettingsStore(selectConnectionStatus);
```

### 3. Memoized Derived Data

```typescript
// Expensive computation only runs when dependencies change
const timeSeries = useMemo(() => {
  const grouped = new Map<number, number>();
  metrics.forEach((m) => {
    const ts = Math.floor(new Date(m.timestamp).getTime() / interval) * interval;
    grouped.set(ts, (grouped.get(ts) || 0) + m.metrics.totalTokens);
  });
  return Array.from(grouped.entries())
    .map(([timestamp, tokens]) => ({ timestamp, tokens }))
    .sort((a, b) => a.timestamp - b.timestamp);
}, [metrics, interval]);
```

### 4. Tab Visibility Handling

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause polling when tab is hidden
      queryClient.cancelQueries({ queryKey: ['metrics'] });
    } else {
      // Resume when visible
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

## State Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Server    │     │ React Query │     │   Zustand   │
│             │     │             │     │             │
│ /api/metrics├────►│ metricsQuery├────►│metricsStore │
│ /api/stats  ├────►│ statsQuery  ├────►│             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐            │
                    │   Zustand   │            │
                    │             │            │
                    │settingsStore│◄───────────┤
                    │             │            │
                    └──────┬──────┘            │
                           │                   │
                           ▼                   ▼
                    ┌─────────────────────────────┐
                    │         Components          │
                    │                             │
                    │  ┌─────┐ ┌─────┐ ┌─────┐    │
                    │  │Chart│ │Gauge│ │Table│    │
                    │  └─────┘ └─────┘ └─────┘    │
                    └─────────────────────────────┘
```

## Summary

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| Server State | React Query | Fetching, polling, caching |
| Client State | Zustand | Buffering, accumulation, UI preferences |
| Derived State | useMemo | Chart data, aggregations |
| Local State | useState | Component-specific UI state |

This architecture provides:
- **Separation of concerns**: Server vs client state
- **Performance**: Buffering, selectors, memoization
- **Simplicity**: Zustand's minimal API
- **Reliability**: React Query's built-in error handling
