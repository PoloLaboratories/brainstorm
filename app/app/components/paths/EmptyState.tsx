import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, iconColor = 'var(--amber)', title, description, children }: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[var(--amber-light)]/20 via-card to-card p-10 text-center shadow-warm border border-border/30">
      <div className="flex justify-center mb-5">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
          style={{ background: `color-mix(in oklch, ${iconColor}, transparent 88%)` }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-base font-display font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-[320px] mx-auto leading-relaxed">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
