'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ObjectiveInsert = Database['public']['Tables']['learning_objectives']['Insert'];
type ObjectiveUpdate = Database['public']['Tables']['learning_objectives']['Update'];

export function useCreateObjective(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objective: Omit<ObjectiveInsert, 'path_id'>) => {
      const { data, error } = await supabase
        .from('learning_objectives')
        .insert({ path_id: pathId, ...objective })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths', pathId] });
    },
  });
}

export function useUpdateObjective(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ObjectiveUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('learning_objectives')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths', pathId] });
    },
  });
}

export function useDeleteObjective(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('learning_objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths', pathId] });
    },
  });
}

export function useToggleObjectiveCompleted(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('learning_objectives')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths', pathId] });
    },
  });
}

export function useMoveObjectiveToModule(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, moduleId }: { id: string; moduleId: string | null }) => {
      const { data, error } = await supabase
        .from('learning_objectives')
        .update({ module_id: moduleId })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths', pathId] });
    },
  });
}
