import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CostGauge } from '@/components/dashboard/CostGauge';
import { TokenUsageChart } from '@/components/dashboard/TokenUsageChart';
import { CostByModelChart } from '@/components/dashboard/CostByModelChart';
import { TopCustomersTable } from '@/components/dashboard/TopCustomersTable';
import { useMetricsPolling } from '@/hooks/useMetricsPolling';

function Dashboard() {
  // Initialize polling
  useMetricsPolling();

  return (
    <DashboardLayout>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <CostGauge />
        <CostByModelChart />

        <TokenUsageChart />
        <TopCustomersTable />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
