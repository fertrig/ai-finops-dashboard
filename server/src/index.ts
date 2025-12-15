import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  initializeHistory,
  getMetricsSince,
  getAggregatedStats,
} from './dataGenerator';
import { MetricsResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize mock data
initializeHistory();

export const MAX_LOOKBACK_MS = 60 * 60 * 1000; // 1 hour
export const DEFAULT_LOOKBACK_MS = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/metrics?since=<timestamp>
 * Returns metrics since the last poll
 */
app.get('/api/metrics', (req: Request, res: Response) => {
  const now = Date.now();
  const sinceParam = req.query.since as string | undefined;

  let sinceTimestamp: number;

  if (sinceParam === undefined) {
    // Default to 5 minutes ago if not provided
    sinceTimestamp = now - DEFAULT_LOOKBACK_MS;
  } else {
    // Check for integer overflow - parseInt returns values beyond MAX_SAFE_INTEGER incorrectly
    const parsed = parseInt(sinceParam, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > Number.MAX_SAFE_INTEGER) {
      res.status(400).json({ error: 'Invalid "since" parameter. Must be a valid positive timestamp.' });
      return;
    }
    sinceTimestamp = parsed;

    // Check if timestamp is in the future
    if (sinceTimestamp > now) {
      res.status(400).json({ error: 'Invalid "since" parameter. Timestamp cannot be in the future.' });
      return;
    }

    // Check if timestamp is more than 1 hour ago
    if (sinceTimestamp < now - MAX_LOOKBACK_MS) {
      res.status(400).json({ error: 'Invalid "since" parameter. Maximum lookback is 1 hour.' });
      return;
    }
  }

  const metrics = getMetricsSince(sinceTimestamp);

  const response: MetricsResponse = {
    metrics,
    nextPollAfter: 2000, // Suggest polling again in 2 seconds
  };

  res.json(response);
});

/**
 * GET /api/stats
 * Returns aggregated statistics for the dashboard
 */
app.get('/api/stats', (_req: Request, res: Response) => {
  const stats = getAggregatedStats();
  res.json(stats);
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Export app for testing
export { app };

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Metrics server running on http://localhost:${PORT}`);
    console.log(`
Available endpoints:
  GET /api/metrics?since=<timestamp>     - Get metrics since timestamp
  GET /api/stats                         - Get aggregated statistics
  GET /api/health                        - Health check
    `);
  });
}
