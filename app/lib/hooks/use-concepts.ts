'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ConceptInsert = Database['public']['Tables']['concepts']['Insert'];
type ConceptUpdate = Database['public']['Tables']['concepts']['Update'];
type ConceptPathInsert = Database['public']['Tables']['concept_paths']['Insert'];
type ConceptModuleInsert = Database['public']['Tables']['concept_modules']['Insert'];
type ConceptObjectiveInsert = Database['public']['Tables']['concept_objectives']['Insert'];

// --- Entity linking config ---

const ENTITY_CONFIG = {
  path: { table: 'concept_paths', fk: 'path_id' },
  module: { table: 'concept_modules', fk: 'module_id' },
  objective: { table: 'concept_objectives', fk: 'objective_id' },
} as const;

export type EntityType = keyof typeof ENTITY_CONFIG;

// --- CRUD hooks ---

export function useConcepts() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['concepts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concepts')
        .select('*, concept_objectives(count), concept_paths(count), concept_modules(count)')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useConcept(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['concepts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concepts')
        .select('*, concept_objectives(count), concept_paths(count), concept_modules(count)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/** Linked entity shape returned by useConceptLinkedEntities */
export interface LinkedEntity {
  id: string;
  title: string;
  href: string;
}

/** Fetches all paths, modules, and objectives linked to a concept */
export function useConceptLinkedEntities(conceptId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['concept-linked-entities', conceptId],
    queryFn: async () => {
      const [pathsRes, modulesRes, objectivesRes] = await Promise.all([
        supabase
          .from('concept_paths')
          .select('path_id, learning_paths(id, title)')
          .eq('concept_id', conceptId),
        supabase
          .from('concept_modules')
          .select('module_id, modules(id, title, path_id)')
          .eq('concept_id', conceptId),
        supabase
          .from('concept_objectives')
          .select('objective_id, learning_objectives(id, title, path_id)')
          .eq('concept_id', conceptId),
      ]);

      if (pathsRes.error) throw pathsRes.error;
      if (modulesRes.error) throw modulesRes.error;
      if (objectivesRes.error) throw objectivesRes.error;

      const paths: LinkedEntity[] = (pathsRes.data ?? [])
        .map((row) => {
          const p = row.learning_paths as unknown as { id: string; title: string } | null;
          return p ? { id: p.id, title: p.title, href: `/paths/${p.id}` } : null;
        })
        .filter((x): x is LinkedEntity => x !== null);

      const modules: LinkedEntity[] = (modulesRes.data ?? [])
        .map((row) => {
          const m = row.modules as unknown as { id: string; title: string; path_id: string } | null;
          return m ? { id: m.id, title: m.title, href: `/paths/${m.path_id}` } : null;
        })
        .filter((x): x is LinkedEntity => x !== null);

      const objectives: LinkedEntity[] = (objectivesRes.data ?? [])
        .map((row) => {
          const o = row.learning_objectives as unknown as { id: string; title: string; path_id: string } | null;
          return o ? { id: o.id, title: o.title, href: `/paths/${o.path_id}` } : null;
        })
        .filter((x): x is LinkedEntity => x !== null);

      return { paths, modules, objectives };
    },
    enabled: !!conceptId,
  });
}

export function useCreateConcept() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (concept: Omit<ConceptInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('concepts')
        .insert({ ...concept, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
    },
  });
}

export function useUpdateConcept() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ConceptUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('concepts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      queryClient.invalidateQueries({ queryKey: ['concepts', data.id] });
    },
  });
}

export function useDeleteConcept() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('concepts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
    },
  });
}

// --- Polymorphic entity linking hooks ---

export function useEntityConcepts(entityType: EntityType, entityId: string) {
  const supabase = createClient();
  const config = ENTITY_CONFIG[entityType];

  return useQuery({
    queryKey: ['entity-concepts', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(config.table)
        .select('concept_id, concepts(*)')
        .eq(config.fk, entityId);

      if (error) throw error;
      return data;
    },
    enabled: !!entityId,
  });
}

export function useLinkConcept() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conceptId,
      entityType,
      entityId,
    }: {
      conceptId: string;
      entityType: EntityType;
      entityId: string;
    }) => {
      let error: any;
      if (entityType === 'path') {
        const row: ConceptPathInsert = { concept_id: conceptId, path_id: entityId };
        ({ error } = await supabase.from('concept_paths').insert(row));
      } else if (entityType === 'module') {
        const row: ConceptModuleInsert = { concept_id: conceptId, module_id: entityId };
        ({ error } = await supabase.from('concept_modules').insert(row));
      } else {
        const row: ConceptObjectiveInsert = { concept_id: conceptId, objective_id: entityId };
        ({ error } = await supabase.from('concept_objectives').insert(row));
      }

      if (error) throw error;
      return { conceptId, entityType, entityId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-concepts', result.entityType, result.entityId] });
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      queryClient.invalidateQueries({ queryKey: ['concept-linked-entities', result.conceptId] });
      queryClient.invalidateQueries({ queryKey: ['graph-data'] });
    },
  });
}

export function useUnlinkConcept() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conceptId,
      entityType,
      entityId,
    }: {
      conceptId: string;
      entityType: EntityType;
      entityId: string;
    }) => {
      const config = ENTITY_CONFIG[entityType];

      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq('concept_id', conceptId)
        .eq(config.fk, entityId);

      if (error) throw error;
      return { conceptId, entityType, entityId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-concepts', result.entityType, result.entityId] });
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      queryClient.invalidateQueries({ queryKey: ['concept-linked-entities', result.conceptId] });
      queryClient.invalidateQueries({ queryKey: ['graph-data'] });
    },
  });
}
