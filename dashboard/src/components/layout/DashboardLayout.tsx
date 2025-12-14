import type { ReactNode } from 'react';
import { ConnectionStatus } from '@/components/controls/ConnectionStatus';
import { PollingControls } from '@/components/controls/PollingControls';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI FinOps Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Real-time AI usage and cost monitoring
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <ConnectionStatus />
              <PollingControls />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
