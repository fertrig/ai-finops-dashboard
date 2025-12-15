# AI FinOps Dashboard

## Demo Recording

A recording of the dashboard in action is available:
- [Video (MOV)](docs/ai-finops-dashboard-02.mov)
- [Video (MP4)](docs/ai-finops-dashboard-02.mp4)

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development/testing)

### Running the Application

```bash
# Start both frontend and backend services
docker compose up
```

The dashboard will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Running Tests

```bash
# Frontend tests
cd dashboard
npm test

# Backend tests
cd server
npm test
```

## Project Deliverables

This project addresses all required deliverables from the take-home assignment:

### Working Code

- **React Application** (TypeScript, strict mode)
  - Built with Vite, React 19, TypeScript
  - Uses Recharts for visualizations, Zustand for state management, ShadCN UI components
  - Fully responsive design

- **Mock Backend Server** (Node.js/Express)
  - Generates realistic streaming data with normal distribution
  - RESTful API endpoints for metrics and aggregated stats
  - Handles 100+ customers across 7 tenants

- **Docker Configuration**
  - Multi-stage Dockerfiles for both frontend and backend
  - Optimized production builds
  - Complete docker-compose.yml for the full stack

### Documentation
The most interesting document is [approach.md](docs/approach.md) which documents my development approach, decisions made, testing philosophy, etc.

- [approach.md](docs/approach.md) - Development approach, decisions made, testing philosophy, etc.
- [architecture-document.md](docs/architecture-document.md) - System architecture and design decisions
- [code-organization.md](docs/code-organization.md) - Folder structure and code organization
- [component-hierarchy.md](docs/component-hierarchy.md) - Component architecture and hierarchy
- [state-management.md](docs/state-management.md) - State management patterns and data flow
- [memory-estimations.md](docs/memory-estimations.md) - Memory usage analysis


### Testing Strategy

**Test Coverage**:
- **Unit Tests**: Critical utility functions
- **Store Tests**: State management logic 
- **Component Tests**: React Testing Library tests for all major components
- **Integration Tests**: User interaction flows (`DashboardLayout.test.tsx`)


### Features Not Implemented (Time Constraints)

❌ **Anomaly Detection Visualization** - Not implemented
❌ **Time Window Controls** - Not implemented (focused on real-time 5-minute window)
❌ **Historical Data Endpoint** - Not implemented (focused on real-time metrics)
❌ **SSE/WebSocket Streaming** - Not implemented (used polling as specified)

## Project Structure

```
revenium-take-home/
├── dashboard/              # React frontend application
│   ├── src/
│   │   ├── api/           # API client layer
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/         # Zustand state management
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript definitions
│   └── Dockerfile
├── server/                 # Express backend API
│   ├── src/
│   │   ├── index.ts        # Express server and routes
│   │   ├── dataGenerator.ts # Mock data generation
│   │   └── types.ts        # Server type definitions
│   └── Dockerfile
├── docs/                   # Documentation
│   ├── architecture-document.md
│   ├── code-organization.md
│   ├── component-hierarchy.md
│   ├── state-management.md
│   ├── approach.md         # Development approach and decisions
│   └── memory-estimations.md
└── docker-compose.yml      # Docker orchestration
```

## Performance Characteristics

- **Handles**: 100+ customers across 7 tenants
- **Update Rate**: Supports hundreds of metric updates per second
- **Memory Usage**: <10MB for metrics storage (both client and server)
- **Response Time**: Sub-second updates with configurable polling intervals
- **Client-side Buffering**: Smooth visual updates without UI jank

