'use client';

import { use } from 'react';
import * as motion from 'motion/react-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useLearningPath } from '@/lib/hooks/use-learning-paths';
import { PathHeader } from '@/app/components/paths/PathHeader';
import { ModuleAccordion } from '@/app/components/paths/ModuleAccordion';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="space-y-8 max-w-4xl"
    >
      <PathHeader path={path} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease }}
      >
        <ModuleAccordion modules={path.modules ?? []} pathId={path.id} />
      </motion.div>
    </motion.div>
  );
}
