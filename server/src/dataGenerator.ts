import { MetricUpdate, TenantConfig, CustomerConfig, AIModel } from './types';
import { TENANT_CONFIGS } from './tenants';

const ONE_SECOND_MS = 1000;
const DATA_GENERATION_INTERVAL_MS = ONE_SECOND_MS;

// Spike simulation
const SPIKE_MULTIPLIER_MEAN = 3;
const SPIKE_MULTIPLIER_STD_DEV_RATIO = 0.17;
const SPIKE_LATENCY_MULTIPLIER = 1.5;

// Traffic variance
const CALLS_STD_DEV_RATIO = 0.3;
const TOKENS_STD_DEV_RATIO = 0.2;
const CUSTOMER_INACTIVE_PROBABILITY = 0.3;

// Token generation by model complexity
const TOKENS_PER_CALL_COMPLEX_MODEL = 2000;
const TOKENS_PER_CALL_SIMPLE_MODEL = 800;
const INPUT_TOKEN_RATIO = 0.6;
const OUTPUT_TOKEN_RATIO = 0.4;

// Latency by model complexity (ms)
const LATENCY_COMPLEX_MODEL_MS = 800;
const LATENCY_SIMPLE_MODEL_MS = 200;
const LATENCY_MIN_MS = 50;
const LATENCY_STD_DEV_RATIO = 0.3;

// Cost precision (decimal places)
const COST_DECIMAL_PLACES = 4;
const COST_PRECISION_MULTIPLIER = Math.pow(10, COST_DECIMAL_PLACES);

// Model pricing (cost per 1K tokens)
const MODEL_PRICING: Record<AIModel, { input: number; output: number }> = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
};

// In-memory storage for generated metrics
let metricsHistory: MetricUpdate[] = [];
let lastGenerationTime = Date.now();

// Random number with normal distribution
// Uses Box-Muller transform: https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random() || Number.MIN_VALUE;
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * stdDev;
}

// Generate spike probability based on time (more spikes during "business hours")
function getSpikeProbability(timestamp: Date): number {
  const hour = timestamp.getHours();
  // Higher spike probability during business hours (9-17)
  if (hour >= 9 && hour <= 17) {
    return 0.05;
  }
  return 0.02;
}

// Generate a single metric update for a customer
function generateMetricForCustomer(
  tenantConfig: TenantConfig,
  customer: CustomerConfig,
  timestamp: Date,
  isSpike: boolean
): MetricUpdate {
  const { model, mockBaseCallsPerSecond, customerId } = customer;
  const pricing = MODEL_PRICING[model];

  const isComplexModel = model.includes('gpt-4') || model.includes('opus');

  // Base values with some randomness
  const spikeMultiplier = isSpike
    ? randomNormal(SPIKE_MULTIPLIER_MEAN, SPIKE_MULTIPLIER_MEAN * SPIKE_MULTIPLIER_STD_DEV_RATIO)
    : 1;
  const calls = Math.max(
    1,
    Math.round(
      randomNormal(mockBaseCallsPerSecond, mockBaseCallsPerSecond * CALLS_STD_DEV_RATIO) *
        spikeMultiplier
    )
  );

  // Tokens vary based on model and usage
  const avgTokensPerCall = isComplexModel
    ? TOKENS_PER_CALL_COMPLEX_MODEL
    : TOKENS_PER_CALL_SIMPLE_MODEL;
  const totalTokens = Math.round(
    calls * randomNormal(avgTokensPerCall, avgTokensPerCall * TOKENS_STD_DEV_RATIO)
  );

  // Calculate cost
  const inputTokens = totalTokens * INPUT_TOKEN_RATIO;
  const outputTokens = totalTokens * OUTPUT_TOKEN_RATIO;
  const totalCost =
    (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;

  // Latency correlates with model complexity
  const baseLatency = isComplexModel ? LATENCY_COMPLEX_MODEL_MS : LATENCY_SIMPLE_MODEL_MS;
  const latencyMultiplier = isSpike ? SPIKE_LATENCY_MULTIPLIER : 1;
  const avgLatencyMs = Math.max(
    LATENCY_MIN_MS,
    Math.round(randomNormal(baseLatency, baseLatency * LATENCY_STD_DEV_RATIO) * latencyMultiplier)
  );

  return {
    timestamp: timestamp.toISOString(),
    tenantId: tenantConfig.tenantId,
    customerId,
    model,
    metrics: {
      totalCalls: calls,
      totalTokens,
      totalCost: Math.round(totalCost * COST_PRECISION_MULTIPLIER) / COST_PRECISION_MULTIPLIER,
      avgLatencyMs,
    },
  };
}

// Generate metrics for a time range
export function generateMetrics(fromTime: number, toTime: number): MetricUpdate[] {
  const metrics: MetricUpdate[] = [];

  for (let time = fromTime; time <= toTime; time += DATA_GENERATION_INTERVAL_MS) {
    const timestamp = new Date(time);
    const spikeProbability = getSpikeProbability(timestamp);

    for (const tenantConfig of TENANT_CONFIGS) {
      // Not all customers are active every DATA_GENERATION_INTERVAL_MS
      const activeCustomers = tenantConfig.customers.filter(
        () => Math.random() > CUSTOMER_INACTIVE_PROBABILITY
      );

      for (const customer of activeCustomers) {
        const isSpike = Math.random() < spikeProbability;
        metrics.push(generateMetricForCustomer(tenantConfig, customer, timestamp, isSpike));
      }
    }
  }

  return metrics;
}

// Initialize history with past 1 hour of data
export function initializeHistory(): void {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * ONE_SECOND_MS;
  metricsHistory = generateMetrics(oneHourAgo, now);
  lastGenerationTime = now;
  console.log(`Initialized history with ${metricsHistory.length} metrics`);
}

// Get metrics since a timestamp (for polling)
export function getMetricsSince(sinceTimestamp: number): MetricUpdate[] {
  const now = Date.now();

  // Generate any new metrics since last generation
  if (now > lastGenerationTime + ONE_SECOND_MS) {
    // Limit generation to max 30 seconds to prevent stack overflow
    const maxGenerationWindow = 30 * ONE_SECOND_MS;
    const fromTime = Math.max(lastGenerationTime + ONE_SECOND_MS, now - maxGenerationWindow);

    const newMetrics = generateMetrics(fromTime, now);
    // Use concat instead of spread to avoid stack overflow with large arrays
    metricsHistory = metricsHistory.concat(newMetrics);
    lastGenerationTime = now;

    // Keep only last 1 hour of history to prevent memory growth
    const oneHourAgo = now - 60 * 60 * ONE_SECOND_MS;
    metricsHistory = metricsHistory.filter(
      (m) => new Date(m.timestamp).getTime() > oneHourAgo
    );
  }

  // Return metrics since the requested timestamp
  return metricsHistory.filter((m) => new Date(m.timestamp).getTime() > sinceTimestamp);
}

// Get aggregated stats for dashboard
export function getAggregatedStats(): {
  totalCostPerHour: number;
  topCustomers: Array<{ customerId: string; totalCost: number }>;
  costByModel: Record<string, number>;
} {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneHourAgoMetrics = metricsHistory.filter(
    (m) => new Date(m.timestamp).getTime() > oneHourAgo
  );

  // Calculate total cost per hour
  const totalCost = oneHourAgoMetrics.reduce((sum, m) => sum + m.metrics.totalCost, 0);

  // Calculate top customers
  const customerCosts = new Map<string, number>();
  for (const metric of oneHourAgoMetrics) {
    const current = customerCosts.get(metric.customerId) || 0;
    customerCosts.set(metric.customerId, current + metric.metrics.totalCost);
  }
  const topCustomers = Array.from(customerCosts.entries())
    .map(([customerId, totalCost]) => ({ customerId, totalCost }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 100);

  // Calculate cost by model (now directly from metric)
  const costByModel: Record<string, number> = {};
  for (const metric of oneHourAgoMetrics) {
    costByModel[metric.model] = (costByModel[metric.model] || 0) + metric.metrics.totalCost;
  }

  return {
    totalCostPerHour: Math.round(totalCost * 100) / 100,
    topCustomers,
    costByModel,
  };
}
