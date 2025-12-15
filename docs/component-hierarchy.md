# Component Hierarchy Diagram

## Full Component Tree

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              index.html                                      │
│                            <div id="root">                                   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           main.tsx                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ <StrictMode>                                                         │    │
│  │   <QueryClientProvider>                          [React Query]       │    │
│  │     <App />                                                          │    │
│  │   </QueryClientProvider>                                             │    │
│  │ </StrictMode>                                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            App.tsx                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ <Dashboard>                                      [useMetricsPolling] │    │
│  │   <DashboardLayout>                                                  │    │
│  │     ...children                                                      │    │
│  │   </DashboardLayout>                                                 │    │
│  │ </Dashboard>                                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DashboardLayout.tsx                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ <div>                                                                │    │
│  │   ┌─────────────────────────────────────────────────────────────┐   │    │
│  │   │ <header>                                                     │   │    │
│  │   │   <h1>AI FinOps Dashboard</h1>                               │   │    │
│  │   │   ┌─────────────────────┐  ┌─────────────────────────────┐  │   │    │
│  │   │   │ <ConnectionStatus>  │  │ <PollingControls>           │  │   │    │
│  │   │   │  └─ <Badge>         │  │  ├─ <Button>                │  │   │    │
│  │   │   │     [settingsStore] │  │  └─ <Select>                │  │   │    │
│  │   │   └─────────────────────┘  │     [settingsStore]         │  │   │    │
│  │   │                            └─────────────────────────────┘  │   │    │
│  │   └─────────────────────────────────────────────────────────────┘   │    │
│  │   ┌─────────────────────────────────────────────────────────────┐   │    │
│  │   │ <main>                                                       │   │    │
│  │   │   {children}                                                 │   │    │
│  │   └─────────────────────────────────────────────────────────────┘   │    │
│  │ </div>                                                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Dashboard Grid (children)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ <div className="grid">                                               │    │
│  │                                                                      │    │
│  │   ┌─────────────────────────┐  ┌─────────────────────────────────┐  │    │
│  │   │ <CostGauge>             │  │ <CostByModelChart>              │  │    │
│  │   │  └─ <Card>              │  │  └─ <Card>                      │  │    │
│  │   │     ├─ <CardHeader>     │  │     ├─ <CardHeader>             │  │    │
│  │   │     └─ <CardContent>    │  │     └─ <CardContent>            │  │    │
│  │   │        └─ <svg> gauge   │  │        └─ <ResponsiveContainer> │  │    │
│  │   │           [metricsStore]│  │           └─ <PieChart>         │  │    │
│  │   └─────────────────────────┘  │              [metricsStore]     │  │    │
│  │                                └─────────────────────────────────┘  │    │
│  │   ┌──────────────────────────────────┐  ┌────────────────────────┐  │    │
│  │   │ <TokenUsageChart>                │  │ <TopCustomersTable>    │  │    │
│  │   │  └─ <Card>                       │  │  └─ <Card>             │  │    │
│  │   │     ├─ <CardHeader>              │  │     ├─ <CardHeader>    │  │    │
│  │   │     └─ <CardContent>             │  │     └─ <CardContent>   │  │    │
│  │   │        └─ <ResponsiveContainer>  │  │        └─ <Table>      │  │    │
│  │   │           └─ <AreaChart>         │  │           ├─ <TableH>  │  │    │
│  │   │              [metricsStore]      │  │           └─ <TableB>  │  │    │
│  │   │              [settingsStore]     │  │              [metrics] │  │    │
│  │   └──────────────────────────────────┘  └────────────────────────┘  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Simplified Tree View

```
App (Dashboard)
├── useMetricsPolling() ─────────────────┐
│                                        │ hooks
└── DashboardLayout                      │
    ├── header                           │
    │   ├── ConnectionStatus ◄───────────┼── settingsStore
    │   │   └── Badge                    │
    │   └── PollingControls ◄────────────┼── settingsStore
    │       ├── Button                   │
    │       └── Select                   │
    └── main (children)                  │
        └── grid                         │
            ├── CostGauge ◄──────────────┼── metricsStore (stats)
            │   └── Card > SVG           │
            ├── CostByModelChart ◄───────┼── metricsStore (stats)
            │   └── Card > PieChart      │
            ├── TokenUsageChart ◄────────┼── metricsStore (metrics)
            │   └── Card > AreaChart     │   settingsStore (interval)
            └── TopCustomersTable ◄──────┴── metricsStore (stats)
                └── Card > Table
```

## Data Flow

```
        ┌──────────────┐
        │   Server     │
        │  /api/metrics│
        │  /api/stats  │
        └──────┬───────┘
               │ fetch
               ▼
        ┌──────────────┐
        │ React Query  │
        │  (polling)   │
        └──────┬───────┘
               │
               ▼
    ┌──────────────────────┐
    │  useMetricsPolling   │
    │  (orchestrator)      │
    └──────┬───────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────────┐
│ metrics │ │  settings   │
│  Store  │ │   Store     │
│ (Zustand)│ │  (Zustand)  │
└────┬────┘ └──────┬──────┘
     │             │
     └──────┬──────┘
            │ selectors
            ▼
    ┌───────────────┐
    │  Components   │
    │  (re-render)  │
    └───────────────┘
```

## Store Dependencies by Component

| Component | metricsStore | settingsStore |
|-----------|--------------|---------------|
| TokenUsageChart | `selectMetrics` | `selectPollingInterval` |
| CostGauge | `selectStats` | - |
| CostByModelChart | `selectStats` | - |
| TopCustomersTable | `selectStats` | - |
| ConnectionStatus | - | `selectConnectionStatus` |
| PollingControls | - | `selectPollingInterval`, `selectIsPollingEnabled` |

## File Structure

```
dashboard/src/
├── main.tsx                    # Entry point, providers
├── App.tsx                     # Dashboard component
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx # Layout wrapper
│   ├── controls/
│   │   ├── ConnectionStatus.tsx
│   │   └── PollingControls.tsx
│   ├── dashboard/
│   │   ├── CostGauge.tsx
│   │   ├── CostByModelChart.tsx
│   │   ├── TokenUsageChart.tsx
│   │   └── TopCustomersTable.tsx
│   └── ui/                     # ShadCN components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── select.tsx
│       └── table.tsx
├── hooks/
│   └── useMetricsPolling.ts    # Polling orchestration
├── stores/
│   ├── metricsStore.ts         # Metrics data + buffering
│   └── settingsStore.ts        # UI settings
├── api/
│   └── metricsApi.ts           # API client
├── types/
│   └── metrics.ts              # TypeScript types
└── utils/
    └── formatters.ts           # Formatting utilities
```
