'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const DEPTH_CONFIG = {
  survey: { label: 'Survey', className: 'bg-muted text-muted-foreground border-border' },
  intermediate: { label: 'Intermediate', className: 'bg-[var(--status-deepening)]/15 text-[var(--status-deepening)] border-[var(--status-deepening)]/30' },
  deep: { label: 'Deep', className: 'bg-[var(--amber)]/15 text-[var(--amber)] border-[var(--amber)]/30' },
} as const;

type Depth = keyof typeof DEPTH_CONFIG;

const DEPTH_OPTIONS: Depth[] = ['survey', 'intermediate', 'deep'];

export function DepthBadge({ depth, onChange }: { depth: Depth; onChange?: (next: Depth) => void }) {
  const [open, setOpen] = useState(false);
  const config = DEPTH_CONFIG[depth];

  if (!onChange) {
    return (
      <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${config.className}`}>
        {config.label}
      </Badge>
    );
  }

  return (
    <div className="relative inline-block">
      <Badge
        variant="outline"
        className={`text-[10px] font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${config.className}`}
        onClick={() => setOpen(!open)}
      >
        {config.label}
      </Badge>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 rounded-md border bg-popover shadow-md py-1 min-w-[120px]">
            {DEPTH_OPTIONS.map((d) => {
              const c = DEPTH_CONFIG[d];
              return (
                <button
                  key={d}
                  onClick={() => { onChange(d); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider hover:bg-accent transition-colors ${
                    d === depth ? 'opacity-50' : ''
                  }`}
                >
                  <span className={`inline-block rounded px-1.5 py-0.5 ${c.className}`}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
