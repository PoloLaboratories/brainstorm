'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { GraphNode, GraphEdge } from '@/app/components/graph/ForceGraph';

export function useGraphData() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['graph-data'],
    queryFn: async () => {
      const nodes: GraphNode[] = [];
      const edges: GraphEdge[] = [];
      const nodeIds = new Set<string>();

      // Fetch all data in parallel
      const [
        conceptsRes,
        objectivesRes,
        conceptObjectivesRes,
        conceptModulesRes,
        conceptPathsRes,
      ] = await Promise.all([
        supabase.from('concepts').select('id, name'),
        supabase.from('learning_objectives').select('id, title, module_id, path_id'),
        supabase.from('concept_objectives').select('concept_id, objective_id'),
        supabase.from('concept_modules').select('concept_id, module_id'),
        supabase.from('concept_paths').select('concept_id, path_id'),
      ]);

      if (conceptsRes.error) throw conceptsRes.error;
      if (objectivesRes.error) throw objectivesRes.error;
      if (conceptObjectivesRes.error) throw conceptObjectivesRes.error;
      if (conceptModulesRes.error) throw conceptModulesRes.error;
      if (conceptPathsRes.error) throw conceptPathsRes.error;

      // Concept nodes
      for (const c of conceptsRes.data) {
        nodes.push({ id: c.id, label: c.name, type: 'concept', r: 18 });
        nodeIds.add(c.id);
      }

      // Objective nodes
      for (const o of objectivesRes.data) {
        nodes.push({ id: o.id, label: o.title, type: 'objective', r: 12 });
        nodeIds.add(o.id);
      }

      // Build lookup maps for transitive edges
      const objectivesByModule = new Map<string, string[]>();
      const objectivesByPath = new Map<string, string[]>();
      for (const o of objectivesRes.data) {
        if (o.module_id) {
          const arr = objectivesByModule.get(o.module_id) ?? [];
          arr.push(o.id);
          objectivesByModule.set(o.module_id, arr);
        }
        if (o.path_id) {
          const arr = objectivesByPath.get(o.path_id) ?? [];
          arr.push(o.id);
          objectivesByPath.set(o.path_id, arr);
        }
      }

      const edgeSet = new Set<string>();
      function addEdge(source: string, target: string) {
        const key = `${source}->${target}`;
        if (!edgeSet.has(key) && nodeIds.has(source) && nodeIds.has(target)) {
          edges.push({ source, target });
          edgeSet.add(key);
        }
      }

      // Direct: concept ↔ objective
      for (const co of conceptObjectivesRes.data) {
        addEdge(co.concept_id, co.objective_id);
      }

      // Transitive via module: concept → module → objectives in that module
      for (const cm of conceptModulesRes.data) {
        const objIds = objectivesByModule.get(cm.module_id) ?? [];
        for (const objId of objIds) {
          addEdge(cm.concept_id, objId);
        }
      }

      // Transitive via path: concept → path → objectives in that path
      for (const cp of conceptPathsRes.data) {
        const objIds = objectivesByPath.get(cp.path_id) ?? [];
        for (const objId of objIds) {
          addEdge(cp.concept_id, objId);
        }
      }

      return { nodes, edges };
    },
  });
}
