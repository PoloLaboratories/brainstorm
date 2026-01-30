'use client';

import { Target, Plus, Trash2, CheckCircle2, Circle, AlertTriangle, ArrowRightLeft, Pencil, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { DepthBadge } from './DepthBadge';
import { ResourceList } from './ResourceList';
import { CreateObjectiveDialog } from './CreateObjectiveDialog';
import { AddResourceDialog } from './AddResourceDialog';
import { useDeleteObjective, useUpdateObjective, useToggleObjectiveCompleted, useMoveObjectiveToModule } from '@/lib/hooks/use-objectives';
import { ConceptTagList } from '@/app/components/concepts/ConceptTagList';
import { Database } from '@/types/database';

type Objective = Database['public']['Tables']['learning_objectives']['Row'];
type Resource = Database['public']['Tables']['resources']['Row'];

interface ModuleRef {
  id: string;
  title: string;
}

interface ObjectiveListProps {
  objectives: (Objective & { resources: Resource[] })[];
  pathId: string;
  moduleId: string | null;
  modules?: ModuleRef[];
  onAllCompleted?: () => void;
  onUncompleted?: () => void;
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

export function ObjectiveList({ objectives, pathId, moduleId, modules, onAllCompleted, onUncompleted }: ObjectiveListProps) {
  const deleteObjective = useDeleteObjective(pathId);
  const updateObjective = useUpdateObjective(pathId);
  const toggleCompleted = useToggleObjectiveCompleted(pathId);
  const moveObjective = useMoveObjectiveToModule(pathId);
  const [warningObjectiveId, setWarningObjectiveId] = useState<string | null>(null);
  const [movingObjectiveId, setMovingObjectiveId] = useState<string | null>(null);
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpandedObjectives((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleToggleCompleted(obj: Objective & { resources: Resource[] }) {
    const newCompleted = !obj.completed;
    if (newCompleted && obj.resources.length > 0) {
      const unreviewedCount = obj.resources.filter((r) => !r.reviewed).length;
      if (unreviewedCount > 0) {
        setWarningObjectiveId(obj.id);
        return;
      }
    }
    completeObjective(obj.id, newCompleted);
  }

  function completeObjective(id: string, completed: boolean) {
    toggleCompleted.mutate(
      { id, completed },
      {
        onSuccess: () => {
          if (completed && onAllCompleted) {
            const allOthersCompleted = objectives
              .filter((o) => o.id !== id)
              .every((o) => o.completed);
            if (allOthersCompleted) onAllCompleted();
          }
          if (!completed && onUncompleted) {
            onUncompleted();
          }
        },
      }
    );
  }

  function handleMoveToModule(objectiveId: string, targetModuleId: string) {
    const newModuleId = targetModuleId === '__path__' ? null : targetModuleId;
    moveObjective.mutate({ id: objectiveId, moduleId: newModuleId });
    setMovingObjectiveId(null);
  }

  const completedCount = objectives.filter((o) => o.completed).length;
  const warningObjective = objectives.find((o) => o.id === warningObjectiveId);
  const unreviewedInWarning = warningObjective?.resources.filter((r) => !r.reviewed).length ?? 0;

  return (
    <div className="space-y-3">
      {objectives.length > 0 && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Objectives
          </span>
          <span className="text-[10px] text-muted-foreground">
            {completedCount}/{objectives.length} completed
          </span>
        </div>
      )}

      {objectives.map((obj) => {
        const isExpanded = expandedObjectives.has(obj.id);
        const resourceCount = obj.resources.length;
        return (
          <div
            key={obj.id}
            className={`rounded-lg border group/obj transition-colors ${
              obj.completed
                ? 'border-[var(--status-resting)]/30 bg-[var(--status-resting)]/5'
                : 'border-border/30 bg-card/50'
            }`}
          >
            {/* Header row — always visible */}
            <div className="flex items-start gap-3 p-4 pb-0">
              <button
                onClick={() => handleToggleCompleted(obj)}
                className="mt-0.5 shrink-0 transition-colors"
                title={obj.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {obj.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--status-resting)]" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 hover:text-[var(--amber)]" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {obj.completed ? (
                    <span className={`text-sm font-medium line-through opacity-60`}>{obj.title}</span>
                  ) : (
                    <InlineEdit
                      value={obj.title}
                      onSave={(val) => updateObjective.mutate({ id: obj.id, title: val })}
                      className="text-sm font-medium"
                    />
                  )}
                  <DepthBadge
                    depth={obj.depth_level as 'survey' | 'intermediate' | 'deep'}
                    onChange={obj.completed ? undefined : (next) => updateObjective.mutate({ id: obj.id, depth_level: next })}
                  />
                  {!obj.completed && modules && modules.length > 0 && (
                    movingObjectiveId === obj.id ? (
                      <div className="flex items-center gap-1">
                        <Select onValueChange={(val) => handleMoveToModule(obj.id, val)}>
                          <SelectTrigger className="h-5 text-[10px] w-32">
                            <SelectValue placeholder="Move to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {moduleId !== null && (
                              <SelectItem value="__path__">Path level</SelectItem>
                            )}
                            {modules.filter((m) => m.id !== moduleId).map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => setMovingObjectiveId(null)}
                          className="text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMovingObjectiveId(obj.id)}
                        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowRightLeft className="h-2.5 w-2.5" />
                        Move
                      </button>
                    )
                  )}
                </div>
              </div>
              {!obj.completed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover/obj:opacity-50 hover:!opacity-100 transition-opacity shrink-0 h-7 w-7 p-0"
                  onClick={() => deleteObjective.mutate(obj.id)}
                  title="Delete objective"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>

            {/* Expand/collapse toggle */}
            <button
              onClick={() => toggleExpanded(obj.id)}
              className="w-full flex items-center gap-2 px-4 py-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
              <span>
                {resourceCount > 0
                  ? `${obj.resources.filter((r) => r.reviewed).length}/${resourceCount} resources reviewed`
                  : 'No resources'}
                {obj.description ? ' · has description' : ''}
              </span>
            </button>

            {/* Collapsible content */}
            {isExpanded && (
              <div className="px-4 pb-4 pl-11">
                <div className="mb-2">
                  <ConceptTagList entityType="objective" entityId={obj.id} />
                </div>
                {obj.completed ? (
                  obj.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed opacity-60">{obj.description}</p>
                  )
                ) : (
                  obj.description ? (
                    <InlineEdit
                      value={obj.description}
                      onSave={(val) => updateObjective.mutate({ id: obj.id, description: val || null })}
                      className="text-xs text-muted-foreground mt-1 leading-relaxed"
                      multiline
                    />
                  ) : (
                    <InlineEdit
                      value=""
                      onSave={(val) => updateObjective.mutate({ id: obj.id, description: val })}
                      className="text-xs text-muted-foreground mt-1 leading-relaxed"
                      multiline
                      placeholder="+ Add description"
                    />
                  )
                )}
                <ResourceList
                  resources={obj.resources}
                  pathId={pathId}
                  readOnly={obj.completed}
                  onAllReviewed={() => {
                    if (!obj.completed) {
                      toggleCompleted.mutate({ id: obj.id, completed: true }, {
                        onSuccess: () => {
                          if (onAllCompleted) {
                            const allOthersCompleted = objectives
                              .filter((o) => o.id !== obj.id)
                              .every((o) => o.completed);
                            if (allOthersCompleted) onAllCompleted();
                          }
                        },
                      });
                    }
                  }}
                  onUnreviewed={() => {
                    if (obj.completed) {
                      toggleCompleted.mutate({ id: obj.id, completed: false }, {
                        onSuccess: () => {
                          if (onUncompleted) onUncompleted();
                        },
                      });
                    }
                  }}
                />
                {!obj.completed && (
                  <div className="flex items-center gap-3 mt-2">
                    <AddResourceDialog pathId={pathId} objectiveId={obj.id}>
                      <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Plus className="h-3 w-3" />
                        Add resource
                      </button>
                    </AddResourceDialog>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {moduleId !== null ? (
        <CreateObjectiveDialog pathId={pathId} moduleId={moduleId}>
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" />
            Add objective
          </button>
        </CreateObjectiveDialog>
      ) : (
        <CreateObjectiveDialog pathId={pathId} moduleId={null}>
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" />
            Add path objective
          </button>
        </CreateObjectiveDialog>
      )}

      {/* Warning dialog for completing with unreviewed resources */}
      <AlertDialog open={!!warningObjectiveId} onOpenChange={(open) => { if (!open) setWarningObjectiveId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[var(--amber)]" />
              Unreviewed resources
            </AlertDialogTitle>
            <AlertDialogDescription>
              This objective has {unreviewedInWarning} unreviewed {unreviewedInWarning === 1 ? 'resource' : 'resources'}.
              You can still mark it as completed, but consider reviewing the resources first for deeper understanding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review first</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (warningObjectiveId) {
                  completeObjective(warningObjectiveId, true);
                  setWarningObjectiveId(null);
                }
              }}
            >
              Complete anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
