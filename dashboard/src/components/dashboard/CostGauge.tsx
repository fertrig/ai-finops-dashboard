import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetricsStore, selectStats } from '@/stores/metricsStore';
import { formatCurrency } from '@/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = {
  value: 'hsl(var(--chart-1))',
  background: 'hsl(var(--muted))',
};

export function CostGauge() {
  const stats = useMetricsStore(selectStats);
  const costPerHour = stats?.totalCostPerHour ?? 0;

  // Calculate gauge percentage (assume max is $100,000/hour for visualization)
  const maxCost = 100000;
  const percentage = Math.min((costPerHour / maxCost) * 100, 100);

  const gaugeData = useMemo(
    () => [
      { name: 'value', value: percentage },
      { name: 'background', value: 100 - percentage },
    ],
    [percentage]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Current Spend Rate (per hour)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-full" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="100%"
                  outerRadius="130%"
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill={COLORS.value} />
                  <Cell fill={COLORS.background} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(costPerHour)}</div>
              </div>
            </div>
          </div>
          <div className="mt-2 flex w-full justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>{formatCurrency(maxCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
