import { useSettingsStore, selectConnectionStatus } from '@/stores/settingsStore';
import { Badge } from '@/components/ui/badge';
import type { ConnectionStatus as ConnectionStatusType } from '@/types/metrics';

const statusConfig: Record<ConnectionStatusType, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'outline' }> = {
  connected: { label: 'Connected', variant: 'success' },
  connecting: { label: 'Connecting...', variant: 'warning' },
  error: { label: 'Error', variant: 'destructive' },
  disconnected: { label: 'Disconnected', variant: 'outline' },
};

export function ConnectionStatus() {
  const connectionStatus = useSettingsStore(selectConnectionStatus);
  const config = statusConfig[connectionStatus];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Status:</span>
      <Badge variant={config.variant}>{config.label}</Badge>
    </div>
  );
}
