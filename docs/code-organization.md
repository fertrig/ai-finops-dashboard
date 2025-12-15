# Code Organization

This document explains the folder structure, naming conventions, module organization, and separation of concerns used in this project.

## Folder Structure and Rationale

### Root Level Structure

```
revenium-take-home/
├── dashboard/          # Frontend React application
├── server/             # Backend Express API server
├── docs/               # Documentation and design files
├── docker-compose.yml  # Docker orchestration
└── README.md          # Project overview
```

**Rationale**: The project follows a **monorepo structure** with clear separation between frontend and backend. This allows:
- Independent development and deployment of each service
- Shared types and contracts (via documentation)
- Simplified local development with Docker Compose
- Clear boundaries between client and server concerns

### Dashboard Structure (`dashboard/`)

```
dashboard/
├── src/
│   ├── api/              # API client layer
│   ├── components/       # React components (organized by feature/type)
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # State management (Zustand)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Pure utility functions
│   ├── lib/              # Third-party library utilities
│   ├── test/              # Test configuration and setup
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── dist/                 # Build output
└── [config files]        # Vite, TypeScript, ESLint, etc.
```

**Rationale**: 
- **Feature-based component organization**: Components are grouped by their purpose (controls, dashboard widgets, layout, UI primitives)
- **Layer separation**: Clear separation between API, state, UI, and utilities
- **Co-located tests**: Test files live next to their source files for better discoverability

### Server Structure (`server/`)

```
server/
├── src/
│   ├── index.ts          # Express server setup and routes
│   ├── dataGenerator.ts  # Mock data generation logic
│   ├── tenants.ts        # Tenant/customer configuration
│   ├── types.ts          # Server-side type definitions
│   └── metrics.test.ts   # Server tests
├── dist/                 # Compiled JavaScript
└── [config files]        # TypeScript, Jest, etc.
```

**Rationale**:
- **Simple structure**: Backend is straightforward with minimal abstraction
- **Single responsibility**: Each file has a clear, focused purpose
- **Test co-location**: Tests live alongside source files

## File Naming Conventions

### Components
- **PascalCase** for component files: `ConnectionStatus.tsx`, `CostGauge.tsx`
- **PascalCase** for component names: Matches file name
- **Test files**: Same name with `.test.tsx` suffix: `ConnectionStatus.test.tsx`

### Utilities and Hooks
- **camelCase** for utility files: `formatters.ts`, `metricsUtils.ts`
- **camelCase** with `use` prefix for hooks: `useMetricsPolling.ts`
- **Test files**: Same name with `.test.ts` suffix: `formatters.test.ts`

### Stores
- **camelCase** with `Store` suffix: `metricsStore.ts`, `settingsStore.ts`
- **Test files**: Same name with `.test.ts` suffix: `settingsStore.test.ts`

### Types
- **camelCase** for type files: `metrics.ts`
- **PascalCase** for type/interface names: `MetricUpdate`, `AggregatedStats`

### API Layer
- **camelCase** with `Api` suffix: `metricsApi.ts`
- Functions use **camelCase**: `fetchMetrics()`, `fetchStats()`

### Configuration Files
- **kebab-case** for config files: `vitest.config.ts`, `vite.config.ts`

**Examples**:
```
✅ Good:
- ConnectionStatus.tsx
- useMetricsPolling.ts
- metricsStore.ts
- formatters.test.ts

❌ Avoid:
- connection-status.tsx
- MetricsStore.ts
- use-metrics-polling.ts
```

## Module Organization Strategy

### Component Organization (Feature-Based)

Components are organized by **feature and type** rather than by technical layer:

```
components/
├── controls/          # User control components (polling, status)
├── dashboard/         # Dashboard-specific widgets (charts, tables)
├── layout/            # Layout components (headers, containers)
└── ui/                # Reusable UI primitives (buttons, cards, badges)
```

**Rationale**:
- **Feature grouping**: Related components are grouped together (e.g., all dashboard widgets)
- **Reusability**: UI primitives are separated for reuse across features
- **Discoverability**: Easy to find components by their purpose
- **Scalability**: New features can add new folders without restructuring

### Layer-Based Organization

Beyond components, the codebase uses **layer-based organization**:

```
src/
├── api/          # External API communication (data fetching)
├── stores/       # State management (business state)
├── hooks/        # React hooks (side effects, data fetching orchestration)
├── components/   # UI layer (presentation)
├── utils/        # Pure functions (business logic, transformations)
└── types/        # Type definitions (contracts)
```

**Data Flow**:
```
API → Stores → Hooks → Components
         ↑
      Utils (transformations)
```

### Import Path Strategy

Uses **TypeScript path aliases** (`@/`) for clean imports:

```typescript
// Instead of: ../../../components/dashboard/CostGauge
import { CostGauge } from '@/components/dashboard/CostGauge';
import { useMetricsStore } from '@/stores/metricsStore';
import { formatCurrency } from '@/utils/formatters';
import type { MetricUpdate } from '@/types/metrics';
```

**Benefits**:
- Cleaner imports regardless of file depth
- Easier refactoring (move files without breaking imports)
- Clear indication of module boundaries

## Separation of Concerns

### 1. Business Logic vs. UI

**Business Logic** (`utils/`, `stores/`):
- Pure functions in `utils/`: `groupMetricsByInterval()`, `filterOldMetrics()`
- State management in `stores/`: Business state, not UI state
- Data transformations: `mergeAndProcessMetrics()`, `formatCurrency()`

**UI Components** (`components/`):
- Presentational components: Receive props, render UI
- No business logic: Components call utilities/stores, don't contain logic
- Example: `CostGauge` uses `formatCurrency()` from utils, doesn't format itself

```typescript
// ✅ Good: Business logic in utils
// utils/metricsUtils.ts
export function groupMetricsByInterval(metrics, interval) { ... }

// components/dashboard/TokenUsageChart.tsx
import { groupMetricsByInterval } from '@/utils/metricsUtils';
const timeSeries = groupMetricsByInterval(metrics, pollingInterval);
```

### 2. Data Fetching vs. State Management

**Data Fetching** (`api/`, `hooks/`):
- `api/metricsApi.ts`: Pure API calls, no state
- `hooks/useMetricsPolling.ts`: Orchestrates fetching, updates stores

**State Management** (`stores/`):
- `metricsStore.ts`: Holds application state
- `settingsStore.ts`: Holds user preferences/UI state

**Separation**:
```typescript
// api/metricsApi.ts - Pure data fetching
export async function fetchMetrics(since: number) {
  const response = await fetch(`/api/metrics?since=${since}`);
  return response.json();
}

// stores/metricsStore.ts - State management
export const useMetricsStore = create((set) => ({
  metrics: [],
  addMetrics: (newMetrics) => { ... }
}));

// hooks/useMetricsPolling.ts - Orchestration
export function useMetricsPolling() {
  const { addMetrics } = useMetricsStore();
  const { data } = useQuery({
    queryFn: () => fetchMetrics(since),
    onSuccess: (data) => addMetrics(data.metrics)
  });
}
```

### 3. Types vs. Implementation

**Types** (`types/`):
- Centralized type definitions: `MetricUpdate`, `AggregatedStats`
- Shared contracts between API, stores, and components
- No implementation, only contracts

**Implementation**:
- Types imported where needed
- Ensures consistency across layers

```typescript
// types/metrics.ts
export interface MetricUpdate {
  timestamp: string;
  tenantId: string;
  // ...
}

// Used in:
// - api/metricsApi.ts (response types)
// - stores/metricsStore.ts (state types)
// - components (prop types)
```

### 4. Test Organization

**Co-location Strategy**:
- Test files live next to source files: `CostGauge.tsx` → `CostGauge.test.tsx`
- Test setup centralized: `test/setup.ts`
- Same folder structure for tests and source

**Benefits**:
- Easy to find tests
- Clear what's tested
- Tests move with code during refactoring

### 5. Configuration vs. Code

**Configuration** (root level):
- Build config: `vite.config.ts`, `tsconfig.json`
- Test config: `vitest.config.ts`
- Linting: `eslint.config.js`
- Docker: `Dockerfile`, `docker-compose.yml`

**Code** (`src/`):
- All application code lives in `src/`
- Clear separation: config changes don't affect code structure

## Key Principles

1. **Single Responsibility**: Each file/module has one clear purpose
2. **Dependency Direction**: UI depends on business logic, not vice versa
3. **Pure Functions**: Business logic is pure and testable
4. **Type Safety**: Types define contracts, implementation follows
5. **Co-location**: Related code (and tests) live together
6. **Feature-First**: Components organized by feature, not technical layer

## Example: Adding a New Feature

To add a new dashboard widget:

1. **Types** (`types/metrics.ts`): Add any new types
2. **Utils** (`utils/`): Add any transformation logic
3. **API** (`api/metricsApi.ts`): Add API calls if needed
4. **Store** (`stores/`): Add state if needed
5. **Component** (`components/dashboard/NewWidget.tsx`): Create widget
6. **Test** (`components/dashboard/NewWidget.test.tsx`): Test widget
7. **Integration** (`App.tsx`): Add to dashboard

Each layer is independent and testable in isolation.

