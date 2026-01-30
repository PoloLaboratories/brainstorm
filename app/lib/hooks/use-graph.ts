'use client';

import { useMemo } from 'react';
import { useLearningPaths } from './use-learning-paths';
import type { GraphNode, GraphEdge } from '@/app/components/graph/ForceGraph';

/** Shape returned by useLearningPaths select with nested modules + objectives */
interface PathWithNested {
  id: string;
  title: string;
  modules?: {
    id: string;
    title: string;
    completed: boolean;
    learning_objectives?: {
      id: string;
      title: string;
      completed: boolean;
    }[];
  }[];
}

/**
 * Derives a knowledge graph from the user's learning paths.
 *
 * Node hierarchy:  Path (largest) → Module (medium) → Objective (smallest)
 * Edge semantics:  path→module (contains), module→objective (contains)
 */
export function useGraphData() {
  const { data: paths, isLoading, error } = useLearningPaths();

  const graph = useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    if (!paths) return { nodes, edges };

    for (const path of paths as PathWithNested[]) {
      nodes.push({
        id: path.id,
        label: path.title,
        type: 'path',
        r: 24,
      });

      const modules = path.modules ?? [];

      for (const mod of modules) {
        nodes.push({
          id: mod.id,
          label: mod.title ?? 'Untitled module',
          type: 'module',
          r: 18,
        });

        edges.push({ source: path.id, target: mod.id });

        const objectives = mod.learning_objectives ?? [];
        for (const obj of objectives) {
          nodes.push({
            id: obj.id,
            label: obj.title ?? 'Untitled objective',
            type: 'objective',
            r: 12,
          });

          edges.push({ source: mod.id, target: obj.id });
        }
      }
    }

    return { nodes, edges };
  }, [paths]);

  return { ...graph, isLoading, error };
}
