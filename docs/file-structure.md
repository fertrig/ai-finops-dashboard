
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
