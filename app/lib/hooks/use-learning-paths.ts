'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type LearningPath = Database['public']['Tables']['learning_paths']['Row'];
type LearningPathInsert = Database['public']['Tables']['learning_paths']['Insert'];
type LearningPathUpdate = Database['public']['Tables']['learning_paths']['Update'];

export function useLearningPaths() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*, modules(id, completed, learning_objectives(id, completed))')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useLearningPath(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['learning-paths', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          modules (
            *,
            learning_objectives (
              *,
              resources (*)
            )
          ),
          learning_objectives!learning_objectives_path_id_fkey (
            *,
            resources (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Separate path-level objectives (no module) from module objectives
      const pathObjectives = (data as any).learning_objectives?.filter(
        (o: any) => o.module_id === null
      ) ?? [];

      return { ...data, pathObjectives };
    },
    enabled: !!id,
  });
}

export function useCreateLearningPath() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (path: Omit<LearningPathInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('learning_paths')
        .insert({ ...path, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
  });
}

export function useUpdateLearningPath() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: LearningPathUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('learning_paths')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      queryClient.invalidateQueries({ queryKey: ['learning-paths', data.id] });
    },
  });
}

export function useDeleteLearningPath() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('learning_paths')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
  });
}
