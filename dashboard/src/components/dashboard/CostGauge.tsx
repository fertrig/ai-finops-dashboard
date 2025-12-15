import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMetricsStore, selectStats } from '@/stores/metricsStore';
import { formatCurrency } from '@/utils/formatters';

const MIN_COST = 0;
const MAX_COST = 250000;

export function CostGauge() {
  const stats = useMetricsStore(selectStats);
  const costPerHour = stats?.totalCostPerHour ?? 0;

  // Calculate needle angle (0% = -90deg/left, 100% = 90deg/right)
  const percentage = Math.min(Math.max((costPerHour - MIN_COST) / (MAX_COST - MIN_COST), 0), 1);
  const needleAngle = -90 + percentage * 180; // -90 to 90 degrees

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Current Spend Rate (per hour)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-full" style={{ height: 140 }}>
            <svg viewBox="0 0 200 110" className="w-full h-full">
              {/* Colored arc segments - semicircle split into 3 equal 60° parts */}
              <path
                d="M 20 100 A 80 80 0 0 1 60 31"
                fill="none"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 60 31 A 80 80 0 0 1 140 31"
                fill="none"
                stroke="hsl(48, 96%, 53%)"
                strokeWidth="12"
              />
              <path
                d="M 140 31 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Needle */}
              <g transform={`rotate(${needleAngle}, 100, 100)`}>
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="30"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="6"
                  fill="hsl(var(--foreground))"
                />
              </g>
              {/* Center cover */}
              <circle
                cx="100"
                cy="100"
                r="4"
                fill="hsl(var(--background))"
              />
            </svg>
          </div>
          {/* Value display */}
          <div className="text-center -mt-2">
            <div className="text-3xl font-bold">{formatCurrency(costPerHour)}</div>
            <div className="text-sm text-muted-foreground">per hour</div>
          </div>
          {/* Min/Max labels */}
          <div className="mt-4 flex w-full justify-between text-xs text-muted-foreground px-4">
            <span>{formatCurrency(MIN_COST)}</span>
            <span>{formatCurrency(MAX_COST)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
