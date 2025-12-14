import { useSettingsStore, selectPollingInterval, selectIsPollingEnabled } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pause, Play } from 'lucide-react';
import type { PollingInterval } from '@/types/metrics';

const intervalOptions: { value: PollingInterval; label: string }[] = [
  { value: 1000, label: '1s' },
  { value: 2000, label: '2s' },
  { value: 5000, label: '5s' },
  { value: 10000, label: '10s' },
];

export function PollingControls() {
  const pollingInterval = useSettingsStore(selectPollingInterval);
  const isPollingEnabled = useSettingsStore(selectIsPollingEnabled);
  const { setPollingInterval, togglePolling } = useSettingsStore();

  const handleIntervalChange = (value: string) => {
    setPollingInterval(parseInt(value, 10) as PollingInterval);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={togglePolling}
        className="w-24"
      >
        {isPollingEnabled ? (
          <>
            <Pause className="h-4 w-4 mr-1" />
            Pause
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-1" />
            Resume
          </>
        )}
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Interval:</span>
        <Select
          value={pollingInterval.toString()}
          onValueChange={handleIntervalChange}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {intervalOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
