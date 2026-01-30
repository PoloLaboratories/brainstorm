import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-[var(--status-exploring)]/15 text-[var(--status-exploring)] border-[var(--status-exploring)]/30' },
  resting: { label: 'Resting', className: 'bg-[var(--status-resting)]/15 text-[var(--status-resting)] border-[var(--status-resting)]/30' },
  not_started: { label: 'Not started', className: 'bg-muted text-muted-foreground border-border' },
  exploring: { label: 'Exploring', className: 'bg-[var(--status-exploring)]/15 text-[var(--status-exploring)] border-[var(--status-exploring)]/30' },
  deepening: { label: 'Deepening', className: 'bg-[var(--status-deepening)]/15 text-[var(--status-deepening)] border-[var(--status-deepening)]/30' },
} as const;

type Status = keyof typeof STATUS_CONFIG;

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${config.className}`}>
      {config.label}
    </Badge>
  );
}
