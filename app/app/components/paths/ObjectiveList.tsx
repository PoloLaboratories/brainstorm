'use client';

import { Target, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DepthBadge } from './DepthBadge';
import { ResourceList } from './ResourceList';
import { CreateObjectiveDialog } from './CreateObjectiveDialog';
import { AddResourceDialog } from './AddResourceDialog';
import { useDeleteObjective } from '@/lib/hooks/use-objectives';
import { Database } from '@/types/database';

type Objective = Database['public']['Tables']['learning_objectives']['Row'];
type Resource = Database['public']['Tables']['resources']['Row'];

interface ObjectiveListProps {
  objectives: (Objective & { resources: Resource[] })[];
  pathId: string;
  moduleId: string;
}

export function ObjectiveList({ objectives, pathId, moduleId }: ObjectiveListProps) {
  const deleteObjective = useDeleteObjective(pathId);

  return (
    <div className="space-y-3">
      {objectives.map((obj) => (
        <div
          key={obj.id}
          className="rounded-lg border border-border/30 bg-card/50 p-4 group/obj"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Target className="h-4 w-4 text-[var(--amber)] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{obj.title}</span>
                  <DepthBadge depth={obj.depth_level as 'survey' | 'intermediate' | 'deep'} />
                </div>
                {obj.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {obj.description}
                  </p>
                )}
                <ResourceList resources={obj.resources} pathId={pathId} />
                <AddResourceDialog pathId={pathId} objectiveId={obj.id}>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2">
                    <Plus className="h-3 w-3" />
                    Add resource
                  </button>
                </AddResourceDialog>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover/obj:opacity-100 transition-opacity shrink-0 h-8 w-8 p-0"
              onClick={() => deleteObjective.mutate(obj.id)}
              title="Delete objective"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      ))}

      <CreateObjectiveDialog pathId={pathId} moduleId={moduleId}>
        <button className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Add objective
        </button>
      </CreateObjectiveDialog>
    </div>
  );
}
