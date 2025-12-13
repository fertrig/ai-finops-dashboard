import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  initializeHistory,
  getMetricsSince,
  getHistoricalMetrics,
  getAggregatedStats,
} from './dataGenerator';
import { MetricsResponse, HistoryResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize mock data
initializeHistory();

/**
 * GET /api/metrics?since=<timestamp>
 * Returns metrics since the last poll
 */
app.get('/api/metrics', (req: Request, res: Response) => {
  const sinceParam = req.query.since as string;
  const sinceTimestamp = sinceParam ? parseInt(sinceParam, 10) : Date.now() - 5000;

  if (isNaN(sinceTimestamp)) {
    res.status(400).json({ error: 'Invalid "since" parameter. Must be a valid timestamp.' });
    return;
  }

  const metrics = getMetricsSince(sinceTimestamp);

  const response: MetricsResponse = {
    metrics,
    nextPollAfter: 2000, // Suggest polling again in 2 seconds
  };

  res.json(response);
});

/**
 * GET /api/metrics/history?from=<timestamp>&to=<timestamp>
 * Returns historical data for time range selection
 */
app.get('/api/metrics/history', (req: Request, res: Response) => {
  const fromParam = req.query.from as string;
  const toParam = req.query.to as string;

  if (!fromParam || !toParam) {
    res.status(400).json({ error: 'Both "from" and "to" parameters are required.' });
    return;
  }

  const fromTimestamp = parseInt(fromParam, 10);
  const toTimestamp = parseInt(toParam, 10);

  if (isNaN(fromTimestamp) || isNaN(toTimestamp)) {
    res.status(400).json({ error: 'Invalid timestamp parameters.' });
    return;
  }

  if (fromTimestamp > toTimestamp) {
    res.status(400).json({ error: '"from" must be less than or equal to "to".' });
    return;
  }

  // Limit range to 24 hours to prevent excessive data generation
  const maxRange = 24 * 60 * 60 * 1000;
  if (toTimestamp - fromTimestamp > maxRange) {
    res.status(400).json({ error: 'Time range cannot exceed 24 hours.' });
    return;
  }

  const metrics = getHistoricalMetrics(fromTimestamp, toTimestamp);

  const response: HistoryResponse = {
    metrics,
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

// Start server
app.listen(PORT, () => {
  console.log(`Metrics server running on http://localhost:${PORT}`);
  console.log(`
Available endpoints:
  GET /api/metrics?since=<timestamp>     - Get metrics since timestamp
  GET /api/metrics/history?from=<ts>&to=<ts> - Get historical metrics
  GET /api/stats                         - Get aggregated statistics
  GET /api/health                        - Health check
  `);
});
