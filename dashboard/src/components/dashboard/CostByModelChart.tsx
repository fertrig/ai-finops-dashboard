import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetricsStore, selectStats } from '@/stores/metricsStore';
import { formatCurrency, formatModelName } from '@/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const MODEL_COLORS = new Map<string, string>([
  ['gpt-4', 'hsl(var(--chart-5))'],
  ['gpt-3.5-turbo', 'hsl(var(--chart-2))'],
  ['claude-3-opus', 'hsl(var(--chart-3))'],
  ['claude-3-sonnet', 'hsl(var(--chart-4))'],
]);

export function CostByModelChart() {
  const stats = useMetricsStore(selectStats);

  const chartData = useMemo(() => {
    const costByModel = stats?.costByModel ?? {};
    return Object.entries(costByModel).map(([model, cost]) => ({
      name: formatModelName(model),
      value: cost,
      model,
    }));
  }, [stats]);

  const totalCost = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Cost by Model (last hour)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Waiting for data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Cost by Model (last hour)</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalCost)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={false}
              >
                {chartData.map((item, index) => (
                  <Cell key={`cell-${index}`} fill={MODEL_COLORS.get(item.model)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Cost']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
