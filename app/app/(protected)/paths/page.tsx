'use client';

import { useState, useMemo } from 'react';
import * as motion from 'motion/react-client';
import { Sparkles, BookOpen, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLearningPaths } from '@/lib/hooks/use-learning-paths';
import { PathCard } from '@/app/components/paths/PathCard';
import { EmptyState } from '@/app/components/paths/EmptyState';
import { CreatePathDialog } from '@/app/components/paths/CreatePathDialog';

const ease = [0.22, 1, 0.36, 1] as const;

type StatusFilter = 'all' | 'active' | 'resting';

export default function PathsPage() {
  const { data: paths, isLoading, error } = useLearningPaths();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredPaths = useMemo(() => {
    if (!paths) return [];
    return paths.filter((p) => {
      const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [paths, search, statusFilter]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--amber)] mb-3">
          Learning Paths
        </p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">
              Your{' '}
              <span className="text-gradient-warm">explorations</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-lg">
              Each path is a journey of discovery. No deadlines, no pressure — just curiosity.
            </p>
          </div>
          {paths && paths.length > 0 && (
            <CreatePathDialog>
              <Button className="gradient-warm text-primary-foreground border-0 shadow-warm">
                <Plus className="h-4 w-4 mr-2" />
                New Path
              </Button>
            </CreatePathDialog>
          )}
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-[var(--amber)]/30 via-border/40 to-transparent" />
      </motion.div>

      {/* Filters */}
      {paths && paths.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search paths..."
                className="w-full rounded-lg border border-border/50 bg-card pl-9 pr-3 py-2 text-sm outline-none placeholder:text-muted-foreground/40 focus:border-[var(--amber)]/50 focus:ring-1 focus:ring-[var(--amber)]/20 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-card p-0.5">
              {(['all', 'active', 'resting'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                    statusFilter === s
                      ? 'bg-[var(--amber)]/15 text-[var(--amber)]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {(search || statusFilter !== 'all') && (
            <p className="text-[11px] text-muted-foreground/60">
              {filteredPaths.length} of {paths.length} {paths.length === 1 ? 'path' : 'paths'}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm">Failed to load your learning paths. Please try again.</p>
        </div>
      ) : paths && paths.length > 0 ? (
        filteredPaths.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
          className="grid md:grid-cols-2 gap-4"
        >
          {filteredPaths.map((path, i) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05, ease }}
            >
              <PathCard path={path} />
            </motion.div>
          ))}
        </motion.div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">No paths match your filters.</p>
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); }}
              className="text-xs text-[var(--amber)] hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
        >
          <EmptyState
            icon={BookOpen}
            title="No learning paths yet"
            description="Start a conversation with the AI to co-design your first learning journey, or create one manually."
          >
            <CreatePathDialog>
              <Button className="gradient-warm text-primary-foreground border-0 shadow-warm hover:shadow-warm-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Create your first path
              </Button>
            </CreatePathDialog>
          </EmptyState>
        </motion.div>
      )}
    </div>
  );
}
