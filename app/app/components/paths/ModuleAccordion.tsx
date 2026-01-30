'use client';

import { useState } from 'react';
import { Layers, Trash2, Plus, CheckCircle2, Circle, Pencil } from 'lucide-react';
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
import { ConceptTagList } from '@/app/components/concepts/ConceptTagList';
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

function InlineEdit({ value, onSave, className, multiline, placeholder }: { value: string; onSave: (val: string) => void; className?: string; multiline?: boolean; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    const isNew = !value && !!placeholder;
    const sharedProps = {
      className: `bg-transparent border-b border-[var(--amber)] outline-none w-full ${className ?? ''}`,
      value: draft,
      placeholder: placeholder ? 'Description...' : '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          if (isNew && !draft.trim()) return;
          onSave(draft.trim()); setEditing(false);
        }
        if (e.key === 'Escape') { setDraft(value); setEditing(false); }
      },
      onBlur: () => {
        if (isNew && !draft.trim()) { setEditing(false); return; }
        if (draft.trim() !== value) onSave(draft.trim());
        setEditing(false);
      },
      autoFocus: true,
    };

    if (multiline) {
      return <textarea {...sharedProps} rows={3} className={`${sharedProps.className} resize-none rounded-md border border-[var(--amber)]/40 px-2 py-1`} />;
    }
    return <input {...sharedProps} />;
  }

  if (!value && placeholder) {
    return (
      <button
        onClick={() => { setDraft(''); setEditing(true); }}
        className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground mt-1 transition-colors"
      >
        {placeholder}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 group/edit">
      <span
        className={`cursor-pointer hover:text-[var(--amber)] transition-colors ${className ?? ''}`}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        {value}
      </span>
      <Pencil
        className="h-2.5 w-2.5 text-muted-foreground/0 group-hover/edit:text-muted-foreground/60 transition-colors cursor-pointer"
        onClick={() => { setDraft(value); setEditing(true); }}
      />
    </span>
  );
}

export function ModuleAccordion({ modules, pathId }: ModuleAccordionProps) {
  const deleteModule = useDeleteModule(pathId);
  const updateModule = useUpdateModule(pathId);
  const toggleCompleted = useToggleModuleCompleted(pathId);

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
                <div className="relative group/mod">
                  {!mod.completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10 shrink-0 h-7 w-7 p-0 opacity-0 group-hover/mod:opacity-50 hover:!opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModule.mutate(mod.id);
                      }}
                      title="Delete module"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
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
                      <div className="flex items-center gap-3 text-left" onClick={(e) => e.stopPropagation()}>
                        <Layers className="h-4 w-4 text-[var(--node-project)] shrink-0" />
                        <div>
                          {mod.completed ? (
                            <span className="text-sm font-semibold line-through opacity-60">{mod.title}</span>
                          ) : (
                            <InlineEdit
                              value={mod.title}
                              onSave={(val) => updateModule.mutate({ id: mod.id, title: val })}
                              className="text-sm font-semibold"
                            />
                          )}
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
                  </div>
                </div>
                <AccordionContent className="px-5 pb-5">
                  <div className="mb-3">
                    <ConceptTagList entityType="module" entityId={mod.id} />
                  </div>
                  {mod.completed ? (
                    mod.description && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed opacity-60">{mod.description}</p>
                      </div>
                    )
                  ) : mod.description ? (
                    <div className="mb-4">
                      <InlineEdit
                        value={mod.description}
                        onSave={(val) => updateModule.mutate({ id: mod.id, description: val || null })}
                        className="text-sm text-muted-foreground leading-relaxed"
                        multiline
                      />
                    </div>
                  ) : (
                    <div className="mb-4">
                      <InlineEdit
                        value=""
                        onSave={(val) => updateModule.mutate({ id: mod.id, description: val })}
                        className="text-sm text-muted-foreground leading-relaxed"
                        multiline
                        placeholder="+ Add description"
                      />
                    </div>
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
                    onUncompleted={() => {
                      if (mod.completed) {
                        toggleCompleted.mutate({ id: mod.id, completed: false });
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
