'use client';

import { useState } from 'react';
import { Layers, Trash2, Plus, CheckCircle2, Circle, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { useDeleteModule, useUpdateModule, useToggleModuleCompleted } from '@/lib/hooks/use-modules';
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
  const updateModule = useUpdateModule(pathId);
  const toggleCompleted = useToggleModuleCompleted(pathId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const moduleRefs = modules.map((m) => ({ id: m.id, title: m.title }));

  function handleToggleCompleted(mod: ModuleWithObjectives) {
    toggleCompleted.mutate({ id: mod.id, completed: !mod.completed });
  }

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
            const completedObjectives = mod.learning_objectives.filter((o) => o.completed).length;
            return (
              <AccordionItem
                key={mod.id}
                value={mod.id}
                className={`rounded-xl border overflow-hidden transition-colors ${
                  mod.completed
                    ? 'border-[var(--status-resting)]/30 bg-[var(--status-resting)]/5 shadow-sm'
                    : 'border-border/30 bg-card shadow-warm'
                }`}
              >
                <div className="flex items-center">
                  <div className="pl-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCompleted(mod);
                      }}
                      title={mod.completed ? 'Mark incomplete' : 'Mark complete'}
                      className="transition-colors"
                    >
                      {mod.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--status-resting)]" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/30 hover:text-[var(--amber)]" />
                      )}
                    </button>
                  </div>
                  <AccordionTrigger className="flex-1 px-3 py-4 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <Layers className="h-4 w-4 text-[var(--node-project)] shrink-0" />
                      <div>
                        <span className={`text-sm font-semibold ${mod.completed ? 'line-through opacity-60' : ''}`}>
                          {mod.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {mod.completed ? (
                            <StatusBadge status="deepening" />
                          ) : (
                            <StatusBadge status={mod.status as 'not_started' | 'exploring' | 'deepening' | 'resting'} />
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            {completedObjectives}/{objectiveCount} objectives
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
                  {editingId === mod.id ? (
                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editTitle.trim()) {
                            updateModule.mutate({ id: mod.id, title: editTitle.trim() });
                            setEditingId(null);
                          }
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="text-sm font-semibold h-8"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="h-8 shrink-0"
                        onClick={() => {
                          if (editTitle.trim()) {
                            updateModule.mutate({ id: mod.id, title: editTitle.trim() });
                          }
                          setEditingId(null);
                        }}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 shrink-0" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(mod.id); setEditTitle(mod.title); }}
                      className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mb-3"
                    >
                      <Pencil className="h-2.5 w-2.5" />
                      Edit name
                    </button>
                  )}
                  {mod.description && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {mod.description}
                    </p>
                  )}
                  <ObjectiveList
                    objectives={mod.learning_objectives}
                    pathId={pathId}
                    moduleId={mod.id}
                    modules={moduleRefs}
                    onAllCompleted={() => {
                      if (!mod.completed) {
                        toggleCompleted.mutate({ id: mod.id, completed: true });
                      }
                    }}
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
