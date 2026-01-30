import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Database } from '@/types/database';

type LearningPath = Database['public']['Tables']['learning_paths']['Row'];

interface PathCardProps {
  path: LearningPath & {
    modules?: { id: string }[];
  };
}

export function PathCard({ path }: PathCardProps) {
  const moduleCount = path.modules?.length ?? 0;
  const updatedAt = new Date(path.updated_at!).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/paths/${path.id}`} className="group block">
      <div className="rounded-xl bg-card p-5 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 border border-border/30">
        <div className="flex items-start justify-between mb-3">
          <StatusBadge status={path.status as 'active' | 'resting'} />
          <span className="text-[11px] text-muted-foreground">{updatedAt}</span>
        </div>
        <h3 className="text-base font-display font-semibold leading-snug mb-1.5 group-hover:text-[var(--amber)] transition-colors">
          {path.title}
        </h3>
        {path.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {path.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-[var(--amber)] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
