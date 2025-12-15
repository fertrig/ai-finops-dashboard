# Architecture Document

This document describes the system architecture, design decisions, and implementation strategies for the AI FinOps Dashboard.

## System Design Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Components │  │    Hooks     │  │    Stores    │           │
│  │   (UI Layer) │◄─┤(Orchestration)├─►│  (State Mgmt)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                  │                  │                 │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                    │
│                            ▼                                    │
│                   ┌──────────────┐                              │
│                   │  API Client  │                              │
│                   │  (metricsApi)│                              │
│                   └──────────────┘                              │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ HTTP REST API
                             │ (Polling)
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                            ▼                                     │
│                   ┌──────────────┐                              │
│                   │   Express    │                              │
│                   │    Server    │                              │
│                   └──────────────┘                              │
│                            │                                     │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   /metrics   │  │    /stats    │  │   /health    │         │
│  │   Endpoint   │  │   Endpoint   │  │   Endpoint   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                                     │
│         └──────────────────┘                                    │
│                            │                                     │
│                            ▼                                     │
│                   ┌──────────────┐                              │
│                   │   Data       │                              │
│                   │  Generator   │                              │
│                   │  (In-Memory) │                              │
│                   └──────────────┘                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User Interaction
   │
   ▼
2. React Component (e.g., PollingControls)
   │
   ▼
3. Settings Store (Zustand) - Updates polling interval/enabled state
   │
   ▼
4. useMetricsPolling Hook
   │
   ├─► React Query (TanStack Query)
   │   │
   │   ├─► Polls /api/metrics?since=<timestamp>
   │   │   │
   │   │   └─► Server generates new metrics since timestamp
   │   │       └─► Returns MetricsResponse
   │   │
   │   └─► Polls /api/stats (less frequent)
   │       │
   │       └─► Server calculates aggregated stats
   │           └─► Returns AggregatedStats
   │
   ▼
5. Metrics Store (Zustand)
   │
   ├─► Buffers incoming metrics (500ms flush interval)
   │
   ├─► Merges with existing metrics
   │
   ├─► Filters old metrics (>5 minutes)
   │
   └─► Sorts by timestamp
   │
   ▼
6. React Components Re-render
   │
   ├─► CostGauge (reads stats.totalCostPerHour)
   ├─► TokenUsageChart (reads metrics, groups by interval)
   ├─► CostByModelChart (reads stats.costByModel)
   └─► TopCustomersTable (reads stats.topCustomers)
```

## Real-Time Data Handling Strategy

### Polling Architecture

The system uses **HTTP polling** rather than WebSockets or Server-Sent Events (SSE) for real-time data updates.

#### Polling Mechanism

1. **Primary Polling**: Metrics endpoint (`/api/metrics`)
   - Configurable interval: 1s, 2s, 5s, or 10s (user-selectable)
   - Uses `since` parameter to fetch only new metrics since last poll
   - Implemented via React Query's `refetchInterval`

2. **Secondary Polling**: Stats endpoint (`/api/stats`)
   - Polls at 2x the metrics interval (minimum 5 seconds)
   - Provides aggregated statistics (hourly costs, top customers, cost by model)
   - Less frequent to reduce server load

#### Error Handling and Backoff

**Exponential Backoff Strategy**:
```typescript
backoffDelay = min(baseInterval * 2^min(errorCount, 4), 16000ms)
```

- **Error Count 0**: Normal polling interval
- **Error Count 1**: 2x interval (e.g., 4s if base is 2s)
- **Error Count 2**: 4x interval (e.g., 8s if base is 2s)
- **Error Count 3**: 8x interval (e.g., 16s if base is 2s)
- **Error Count 4+**: Capped at 16s maximum

**Connection Status States**:
- `connecting`: Initial load or first fetch
- `connected`: Successful data fetch
- `error`: Network error or server error
- `disconnected`: Polling disabled or tab hidden

#### Data Buffering and Smoothing

**Client-Side Buffering**:
- Metrics are buffered outside the Zustand store to avoid unnecessary re-renders
- Buffer flushes every 500ms using `requestAnimationFrame` + `setTimeout`
- Ensures smooth visual updates without UI jank

**Data Processing Pipeline**:
1. New metrics arrive → Added to buffer
2. Buffer flush scheduled (500ms debounce)
3. Buffer merged with existing metrics
4. Old metrics filtered (>5 minutes)
5. Metrics sorted by timestamp
6. Store updated → Components re-render

## Key Design Decisions and Tradeoffs

### 1. State Management: Zustand vs. Redux vs. Context API

**Decision**: Zustand

**Rationale**:
- ✅ **Lightweight**: Minimal boilerplate, no providers needed
- ✅ **TypeScript First**: Excellent TypeScript support
- ✅ **Performance**: No unnecessary re-renders, fine-grained subscriptions
- ✅ **Simplicity**: Easy to understand and maintain
- ✅ **No Middleware Needed**: Direct state updates sufficient for this use case

**Tradeoff**: Less ecosystem/tooling than Redux, but sufficient for this application's needs.

### 2. Data Fetching: React Query vs. Custom Hooks

**Decision**: TanStack Query (React Query)

**Rationale**:
- ✅ **Built-in Polling**: `refetchInterval` handles polling automatically
- ✅ **Error Handling**: Automatic retry logic and error states
- ✅ **Caching**: Prevents duplicate requests
- ✅ **Background Updates**: Can update data in background
- ✅ **Tab Visibility**: Built-in support for pausing when tab is hidden

**Tradeoff**: Additional dependency, but provides significant value for polling scenarios.

### 3. Server-Side Aggregation vs. Client-Side Calculation

**Decision**: Server-side aggregation

**Rationale**:
- ✅ **Efficiency**: Only aggregated data sent over network (not all raw metrics)
- ✅ **Performance**: Server can process large datasets more efficiently
- ✅ **Bandwidth**: Reduces data transfer, especially important for mobile
- ✅ **Consistency**: Single source of truth for calculations

**Tradeoff**: Server must maintain history and calculate stats, but this is acceptable given the benefits.

### 4. In-Memory Data Storage vs. Database

**Decision**: In-memory storage (for MVP)

**Rationale**:
- ✅ **Simplicity**: No database setup required
- ✅ **Performance**: Fast reads/writes
- ✅ **Development Speed**: Faster to implement and test
- ✅ **Sufficient for MVP**: Handles requirements (hundreds of updates/second)

**Tradeoff**: 
- ❌ **Data Loss**: Data lost on server restart
- ❌ **Scalability**: Single server instance only
- ❌ **Persistence**: No historical data retention

**Future Consideration**: For production, would migrate to a time-series database (e.g., InfluxDB, TimescaleDB).

### 5. Component Organization: Feature-Based vs. Layer-Based

**Decision**: Hybrid approach (feature-based components, layer-based utilities)

**Rationale**:
- ✅ **Discoverability**: Easy to find components by feature
- ✅ **Maintainability**: Related code lives together
- ✅ **Reusability**: UI primitives separated for reuse
- ✅ **Separation of Concerns**: Business logic separated from UI

**Structure**:
```
components/
├── controls/     # Feature: User controls
├── dashboard/    # Feature: Dashboard widgets
├── layout/       # Feature: Layout components
└── ui/           # Layer: Reusable primitives
```

### 6. Type Safety: Shared Types vs. Duplicate Types

**Decision**: Separate type definitions (frontend and backend)

**Rationale**:
- ✅ **Independence**: Frontend and backend can evolve independently
- ✅ **No Build Coupling**: Don't need to build backend to build frontend
- ✅ **Clear Contracts**: Types define API contracts

**Tradeoff**: 
- ❌ **Duplication**: Types must be kept in sync manually
- ❌ **Type Drift**: Risk of types diverging

**Future Consideration**: Use tRPC or code generation to share types automatically.

### 7. Chart Library: Recharts vs. D3.js vs. Chart.js

**Decision**: Recharts

**Rationale**:
- ✅ **React Native**: Built specifically for React
- ✅ **Declarative**: Component-based API fits React patterns
- ✅ **Responsive**: Built-in responsive container
- ✅ **Customizable**: Good balance of features and customization
- ✅ **TypeScript**: Good TypeScript support

**Tradeoff**: Less flexible than D3.js, but more React-friendly and sufficient for dashboard needs.

### 8. Styling: Tailwind CSS vs. CSS Modules vs. Styled Components

**Decision**: Tailwind CSS

**Rationale**:
- ✅ **Rapid Development**: Utility classes enable fast UI development
- ✅ **Consistency**: Design system enforced through utilities
- ✅ **Responsive**: Built-in responsive utilities
- ✅ **Bundle Size**: Purges unused styles in production
- ✅ **No Runtime**: No JavaScript overhead

**Tradeoff**: Larger HTML files, but benefits outweigh for this use case.

## Responsive Design Approach

### Breakpoint Strategy

The application uses Tailwind's default breakpoint system:

- **Mobile First**: Base styles target mobile devices
- **sm**: 640px+ (small tablets, large phones)
- **md**: 768px+ (tablets)
- **lg**: 1024px+ (desktops)
- **xl**: 1280px+ (large desktops)

### Layout Responsiveness

#### Header Layout
```tsx
// Mobile: Stacked vertically
flex-col gap-4

// Small screens and up: Horizontal layout
sm:flex-row sm:items-center sm:justify-between
```

**Behavior**:
- **Mobile**: Title and controls stack vertically
- **Tablet+**: Title and controls side-by-side

#### Dashboard Grid
```tsx
// Mobile: Single column
grid gap-6

// Medium screens: 2 columns
md:grid-cols-2

// Large screens: 2 columns (maintained)
lg:grid-cols-2
```

**Widget Layout**:
- **CostGauge**: 1 column (mobile), 1 column (desktop)
- **CostByModelChart**: 1 column (mobile), 1 column (desktop)
- **TokenUsageChart**: 1 column (mobile), **2 columns** (desktop) - spans wider
- **TopCustomersTable**: 1 column (mobile), 1 column (desktop)

#### Token Usage Chart Special Handling

The Token Usage Chart uses `col-span-1 md:col-span-2` to:
- Take full width on mobile (better readability)
- Span 2 columns on medium+ screens (more visual prominence for time series)

### Component-Level Responsiveness

#### Charts
- **ResponsiveContainer**: Recharts component that automatically adjusts to container size
- **Fixed Heights**: Charts use `h-64` (256px) with `min-h-[256px]` to ensure minimum size
- **Aspect Ratios**: Maintained through container constraints

#### Tables
- **Horizontal Scroll**: Tables can scroll horizontally on small screens if needed
- **Text Sizing**: Responsive font sizes using Tailwind utilities

#### Controls
- **Button Sizing**: Responsive button sizes (`sm`, `lg` variants)
- **Select Dropdowns**: Full width on mobile, constrained width on desktop

### Typography Scaling

```tsx
// Headers scale down on mobile
text-2xl        // Desktop: 24px
text-lg         // Mobile: 18px (implicit)

// Body text remains consistent
text-sm         // 14px across all breakpoints
```

### Spacing and Padding

```tsx
// Container padding
px-4           // 16px on all sides (mobile-friendly)
py-4           // Vertical padding

// Grid gaps
gap-6           // 24px between grid items
gap-4           // 16px in flex containers
```

### Touch-Friendly Design

- **Button Sizes**: Minimum 36px height (`h-9`) for touch targets
- **Spacing**: Adequate spacing between interactive elements
- **No Hover-Only Actions**: All functionality accessible without hover

### Responsive Testing Strategy

The application is tested and optimized for:
- **Mobile**: 320px - 639px (portrait phones)
- **Tablet**: 640px - 1023px (tablets, landscape phones)
- **Desktop**: 1024px+ (laptops, desktops)

### Future Enhancements

Potential responsive improvements:
- **Collapsible Sidebar**: For additional controls on larger screens
- **Chart Responsiveness**: Dynamic chart configuration based on screen size
- **Table Pagination**: For top customers table on mobile
- **Progressive Enhancement**: Enhanced features for larger screens

## Performance Considerations

### Frontend Optimizations

1. **Memoization**: `useMemo` for expensive calculations (time series grouping, totals)
2. **Selective Re-renders**: Zustand selectors prevent unnecessary component updates
3. **Debounced Updates**: 500ms buffer flush prevents UI jank
4. **Lazy Loading**: Components loaded on demand (future enhancement)
5. **Code Splitting**: Vite automatically splits code by route/component

### Backend Optimizations

1. **Incremental Fetching**: Only new metrics since last poll
2. **Server-Side Aggregation**: Reduces data transfer
3. **Input Validation**: Prevents expensive operations (e.g., generating hours of data)
4. **Efficient Data Structures**: Maps and arrays optimized for lookups

### Memory Management

- **Automatic Cleanup**: Metrics older than 5 minutes automatically removed
- **Bounded Storage**: Server limits lookback to 1 hour maximum
- **No Memory Leaks**: Proper cleanup of event listeners and timers

## Security Considerations

### Current Implementation

- **CORS**: Currently allows all origins (should be tightened for production)
- **Input Validation**: Server validates all query parameters
- **No Authentication**: MVP assumes trusted environment

### Production Recommendations

- **CORS Whitelist**: Restrict to known frontend origins
- **Rate Limiting**: Prevent abuse of polling endpoints
- **Authentication**: Add JWT or session-based auth
- **HTTPS**: Enforce HTTPS in production
- **Input Sanitization**: Additional validation layers

## Scalability Considerations

### Current Limitations

- **Single Server Instance**: In-memory storage doesn't scale horizontally
- **No Load Balancing**: Single point of failure
- **No Caching**: Every request hits data generator

### Future Scalability Path

1. **Database Migration**: Move to time-series database
2. **Caching Layer**: Redis for frequently accessed stats
3. **Horizontal Scaling**: Stateless API servers behind load balancer
4. **CDN**: Static assets served from CDN
5. **WebSocket Migration**: For higher update rates (if needed)

