import { Badge } from '@/components/ui/badge';

const DEPTH_CONFIG = {
  survey: { label: 'Survey', className: 'bg-muted text-muted-foreground border-border' },
  intermediate: { label: 'Intermediate', className: 'bg-[var(--status-deepening)]/15 text-[var(--status-deepening)] border-[var(--status-deepening)]/30' },
  deep: { label: 'Deep', className: 'bg-[var(--amber)]/15 text-[var(--amber)] border-[var(--amber)]/30' },
} as const;

type Depth = keyof typeof DEPTH_CONFIG;

export function DepthBadge({ depth }: { depth: Depth }) {
  const config = DEPTH_CONFIG[depth];
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${config.className}`}>
      {config.label}
    </Badge>
  );
}
