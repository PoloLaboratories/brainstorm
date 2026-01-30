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

      // Fetch concepts and objectives in parallel
      const [conceptsRes, objectivesRes, conceptObjectivesRes, graphEdgesRes] = await Promise.all([
        supabase.from('concepts').select('id, name'),
        supabase.from('learning_objectives').select('id, title'),
        supabase.from('concept_objectives').select('concept_id, objective_id'),
        supabase.from('graph_edges').select('source_id, source_type, target_id, target_type'),
      ]);

      if (conceptsRes.error) throw conceptsRes.error;
      if (objectivesRes.error) throw objectivesRes.error;
      if (conceptObjectivesRes.error) throw conceptObjectivesRes.error;
      if (graphEdgesRes.error) throw graphEdgesRes.error;

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

      // Edges from concept_objectives junction
      const edgeSet = new Set<string>();
      for (const co of conceptObjectivesRes.data) {
        const key = `${co.concept_id}->${co.objective_id}`;
        if (!edgeSet.has(key) && nodeIds.has(co.concept_id) && nodeIds.has(co.objective_id)) {
          edges.push({ source: co.concept_id, target: co.objective_id });
          edgeSet.add(key);
        }
      }

      // Explicit graph_edges (filtered to existing nodes)
      for (const ge of graphEdgesRes.data) {
        const key = `${ge.source_id}->${ge.target_id}`;
        if (!edgeSet.has(key) && nodeIds.has(ge.source_id) && nodeIds.has(ge.target_id)) {
          edges.push({ source: ge.source_id, target: ge.target_id });
          edgeSet.add(key);
        }
      }

      return { nodes, edges };
    },
  });
}
