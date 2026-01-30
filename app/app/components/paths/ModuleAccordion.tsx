'use client';

import { Layers, Trash2, Plus } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { ObjectiveList } from './ObjectiveList';
import { CreateModuleDialog } from './CreateModuleDialog';
import { useDeleteModule } from '@/lib/hooks/use-modules';
import { Database } from '@/types/database';

type Module = Database['public']['Tables']['modules']['Row'];
type Objective = Database['public']['Tables']['learning_objectives']['Row'];
type Resource = Database['public']['Tables']['resources']['Row'];

type ModuleWithObjectives = Module & {
  learning_objectives: (Objective & { resources: Resource[] })[];
};

interface ModuleAccordionProps {
  modules: ModuleWithObjectives[];
  pathId: string;
}

export function ModuleAccordion({ modules, pathId }: ModuleAccordionProps) {
  const deleteModule = useDeleteModule(pathId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold">Modules</h2>
        <CreateModuleDialog pathId={pathId}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Module
          </Button>
        </CreateModuleDialog>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
          <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No modules yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Add modules to organize your learning objectives.
          </p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {modules.map((mod) => {
            const objectiveCount = mod.learning_objectives.length;
            return (
              <AccordionItem
                key={mod.id}
                value={mod.id}
                className="rounded-xl border border-border/30 bg-card shadow-warm overflow-hidden"
              >
                <div className="flex items-center">
                  <AccordionTrigger className="flex-1 px-5 py-4 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Layers className="h-4 w-4 text-[var(--node-project)] shrink-0" />
                      <div>
                        <span className="text-sm font-semibold">{mod.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={mod.status as 'not_started' | 'exploring' | 'deepening' | 'resting'} />
                          <span className="text-[11px] text-muted-foreground">
                            {objectiveCount} {objectiveCount === 1 ? 'objective' : 'objectives'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-3 shrink-0 h-8 w-8 p-0 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteModule.mutate(mod.id);
                    }}
                    title="Delete module"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
                <AccordionContent className="px-5 pb-5">
                  {mod.description && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {mod.description}
                    </p>
                  )}
                  <ObjectiveList
                    objectives={mod.learning_objectives}
                    pathId={pathId}
                    moduleId={mod.id}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
