import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetricsStore, selectMetrics } from '@/stores/metricsStore';
import { useSettingsStore, selectPollingInterval } from '@/stores/settingsStore';
import { formatCompactNumber, formatShortTime } from '@/utils/formatters';
import { groupMetricsByInterval } from '@/utils/metricsUtils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function TokenUsageChart() {
  const metrics = useMetricsStore(selectMetrics);
  const pollingInterval = useSettingsStore(selectPollingInterval);

  const timeSeries = useMemo(() => {
    const grouped = groupMetricsByInterval(metrics, pollingInterval);
    return grouped.map((point) => ({
      ...point,
      time: formatShortTime(new Date(point.timestamp)),
    }));
  }, [metrics, pollingInterval]);

  const totalTokens = useMemo(() => {
    return timeSeries.reduce((sum, point) => sum + point.tokens, 0);
  }, [timeSeries]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Token Usage (last 5 minutes)</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: {formatCompactNumber(totalTokens)} tokens
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-h-[256px]">
          {timeSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeSeries}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCompactNumber(value)}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [formatCompactNumber(value), 'Tokens']}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  fill="url(#tokenGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Waiting for data...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
