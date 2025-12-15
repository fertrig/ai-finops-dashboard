# Memory Estimation

## Metric Object Size

```
  // Single MetricUpdate object
  {
    timestamp: "2025-12-15T10:30:00.000Z",  // ~24 bytes
    tenantId: "tenant-stark",               // ~20 bytes
    customerId: "stark-jarvis",             // ~20 bytes
    model: "gpt-4",                         // ~10 bytes
    metrics: {
      totalCalls: 15,                       // 8 bytes
      totalTokens: 30000,                   // 8 bytes
      totalCost: 1.2345,                    // 8 bytes
      avgLatencyMs: 450                     // 8 bytes
    }
  }
  // Object overhead + references: ~50 bytes
  // Total per metric: ~150-200 bytes
```

## Server (dataGenerator.ts) - 10 minute retention

  | Parameter            | Value                                            |
  |----------------------|--------------------------------------------------|
  | Total customers      | 100                                              |
  | Active rate          | 70% (due to CUSTOMER_INACTIVE_PROBABILITY = 0.3) |
  | Active customers/sec | ~70                                              |
  | Retention            | 10 minutes (600 seconds)                         |
  | Total metrics        | 70 × 600 = 42,000                                |
  | Size per metric      | ~175 bytes                                       |
  | Total memory         | ~7.4 MB                                          |

## Frontend (metricsStore.ts) - 5 minute retention

  | Parameter            | Value                   |
  |----------------------|-------------------------|
  | Active customers/sec | ~70                     |
  | Retention            | 5 minutes (300 seconds) |
  | Total metrics        | 70 × 300 = 21,000       |
  | Size per metric      | ~175 bytes              |
  | Total memory         | ~3.7 MB                 |

## Initial Load Spike

  On dashboard first load (requesting 5 minutes of history):
  - Server generates/sends ~21,000 metrics
  - JSON payload (with string overhead): ~4-5 MB
  - Both server and client temporarily hold this during transfer

## Summary

  | Location         | Retention | Metrics Count | Memory  |
  |------------------|-----------|---------------|---------|
  | Server           | 10 min    | ~42,000       | ~7.4 MB |
  | Frontend         | 5 min     | ~21,000       | ~3.7 MB |
  | Initial transfer | -         | ~21,000       | ~4-5 MB |

## Scaling Considerations

  If you increase customers or retention:

  | Scenario                  | Server | Frontend |
  |---------------------------|--------|----------|
  | 200 customers             | ~15 MB | ~7.5 MB  |
  | 500 customers             | ~37 MB | ~18.5 MB |
  | 1 hour retention (server) | ~44 MB | ~3.7 MB  |
  | 1 hour retention (both)   | ~44 MB | ~44 MB   |
