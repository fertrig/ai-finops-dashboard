import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMetricsStore, selectStats } from '@/stores/metricsStore';
import { formatCurrency } from '@/utils/formatters';

export function TopCustomersTable() {
  const stats = useMetricsStore(selectStats);

  const topCustomers = useMemo(() => {
    return (stats?.topCustomers ?? []).slice(0, 10);
  }, [stats]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top 10 Customers by Spend (last hour)</CardTitle>
      </CardHeader>
      <CardContent>
        {topCustomers.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Waiting for data...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((customer, index) => (
                <TableRow key={customer.customerId}>
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{customer.customerId}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(customer.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
