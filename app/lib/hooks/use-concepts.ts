'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ConceptInsert = Database['public']['Tables']['concepts']['Insert'];
type ConceptUpdate = Database['public']['Tables']['concepts']['Update'];

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
      const config = ENTITY_CONFIG[entityType];

      const { data, error } = await supabase
        .from(config.table)
        .insert({ concept_id: conceptId, [config.fk]: entityId } as any)
        .select()
        .single();

      if (error) throw error;
      return { data, entityType, entityId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-concepts', result.entityType, result.entityId] });
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
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
      return { entityType, entityId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entity-concepts', result.entityType, result.entityId] });
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      queryClient.invalidateQueries({ queryKey: ['graph-data'] });
    },
  });
}
