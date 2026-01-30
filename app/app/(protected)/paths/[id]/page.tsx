'use client';

import { use } from 'react';
import * as motion from 'motion/react-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useLearningPath } from '@/lib/hooks/use-learning-paths';
import { PathHeader } from '@/app/components/paths/PathHeader';
import { ModuleAccordion } from '@/app/components/paths/ModuleAccordion';
import { ObjectiveList } from '@/app/components/paths/ObjectiveList';
import { Target } from 'lucide-react';
import { ConceptTagList } from '@/app/components/concepts/ConceptTagList';

const ease = [0.22, 1, 0.36, 1] as const;

export default function PathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: path, isLoading, error } = useLearningPath(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-3 mt-8">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm">
            {error ? 'Failed to load this learning path.' : 'Learning path not found.'}
          </p>
        </div>
      </div>
    );
  }

  const pathObjectives = (path as any).pathObjectives ?? [];
  const modules = path.modules ?? [];
  const moduleRefs = modules.map((m: any) => ({ id: m.id, title: m.title }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="space-y-8 max-w-4xl"
    >
      <PathHeader path={path} />

      {/* Path-level concepts */}
      <div className="mt-2">
        <ConceptTagList entityType="path" entityId={path.id} />
      </div>

      {/* Path-level objectives */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15, ease }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--amber)]" />
            <h2 className="text-lg font-display font-semibold">Path Objectives</h2>
          </div>
          <ObjectiveList
            objectives={pathObjectives}
            pathId={path.id}
            moduleId={null}
            modules={moduleRefs}
          />
        </div>
      </motion.div>

      {/* Visual section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25, ease }}
      >
        <ModuleAccordion modules={modules} pathId={path.id} />
      </motion.div>
    </motion.div>
  );
}
