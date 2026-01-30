import Link from 'next/link';
import { BookOpen, ArrowRight, Target } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Database } from '@/types/database';

type LearningPath = Database['public']['Tables']['learning_paths']['Row'];

interface PathCardProps {
  path: LearningPath & {
    modules?: {
      id: string;
      completed: boolean;
      learning_objectives: { id: string; completed: boolean }[];
    }[];
  };
}

export function PathCard({ path }: PathCardProps) {
  const modules = path.modules ?? [];
  const moduleCount = modules.length;
  const updatedAt = new Date(path.updated_at!).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Aggregate objective progress across all modules
  const allObjectives = modules.flatMap((m) => m.learning_objectives ?? []);
  const totalObjectives = allObjectives.length;
  const completedObjectives = allObjectives.filter((o) => o.completed).length;
  const progress = totalObjectives > 0 ? completedObjectives / totalObjectives : 0;

  return (
    <Link href={`/paths/${path.id}`} className="group block">
      <div className="relative rounded-xl bg-card p-5 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 border border-border/30 overflow-hidden">
        {/* Subtle top accent line that reveals on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: path.status === 'resting'
              ? 'linear-gradient(90deg, var(--sage), transparent)'
              : 'linear-gradient(90deg, var(--amber), var(--coral), transparent)',
          }}
        />

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

        {/* Progress bar */}
        {totalObjectives > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Target className="h-2.5 w-2.5" />
                Progress
              </span>
              <span className="text-[10px] text-muted-foreground">
                {completedObjectives}/{totalObjectives}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(progress * 100, progress > 0 ? 4 : 0)}%`,
                  background: progress >= 1
                    ? 'var(--sage)'
                    : 'linear-gradient(90deg, var(--amber), var(--coral))',
                }}
              />
            </div>
          </div>
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
