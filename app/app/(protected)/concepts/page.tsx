'use client';

import { useState, useMemo } from 'react';
import * as motion from 'motion/react-client';
import { Sparkles, Brain, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConcepts } from '@/lib/hooks/use-concepts';
import { ConceptCard } from '@/app/components/concepts/ConceptCard';
import { EmptyState } from '@/app/components/paths/EmptyState';
import { CreateConceptDialog } from '@/app/components/concepts/CreateConceptDialog';

const ease = [0.22, 1, 0.36, 1] as const;

export default function ConceptsPage() {
  const { data: concepts, isLoading, error } = useConcepts();
  const [search, setSearch] = useState('');

  const filteredConcepts = useMemo(() => {
    if (!concepts) return [];
    return concepts.filter((c) => {
      return !search || c.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [concepts, search]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--node-concept)] mb-3">
          Concepts
        </p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">
              Your{' '}
              <span className="text-gradient-warm">knowledge units</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-lg">
              Reusable ideas that connect across your learning journeys.
            </p>
          </div>
          {concepts && concepts.length > 0 && (
            <CreateConceptDialog>
              <Button className="gradient-warm text-primary-foreground border-0 shadow-warm">
                <Plus className="h-4 w-4 mr-2" />
                New Concept
              </Button>
            </CreateConceptDialog>
          )}
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-[var(--node-concept)]/30 via-border/40 to-transparent" />
      </motion.div>

      {/* Search */}
      {concepts && concepts.length > 0 && (
        <div className="space-y-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search concepts..."
              className="w-full rounded-lg border border-border/50 bg-card pl-9 pr-3 py-2 text-sm outline-none placeholder:text-muted-foreground/40 focus:border-[var(--node-concept)]/50 focus:ring-1 focus:ring-[var(--node-concept)]/20 transition-colors"
            />
          </div>
          {search && (
            <p className="text-[11px] text-muted-foreground/60">
              {filteredConcepts.length} of {concepts.length} {concepts.length === 1 ? 'concept' : 'concepts'}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm">Failed to load your concepts. Please try again.</p>
        </div>
      ) : concepts && concepts.length > 0 ? (
        filteredConcepts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredConcepts.map((concept, i) => (
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05, ease }}
            >
              <ConceptCard concept={concept} />
            </motion.div>
          ))}
        </motion.div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">No concepts match your search.</p>
            <button
              onClick={() => setSearch('')}
              className="text-xs text-[var(--node-concept)] hover:underline mt-2"
            >
              Clear search
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
            icon={Brain}
            iconColor="var(--node-concept)"
            title="No concepts yet"
            description="Concepts are reusable knowledge units that connect across your paths, modules, and projects."
          >
            <CreateConceptDialog>
              <Button className="gradient-warm text-primary-foreground border-0 shadow-warm hover:shadow-warm-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Create your first concept
              </Button>
            </CreateConceptDialog>
          </EmptyState>
        </motion.div>
      )}
    </div>
  );
}
