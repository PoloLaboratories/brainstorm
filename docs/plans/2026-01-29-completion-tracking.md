# Completion Tracking & Flexible Objectives Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add resource review tracking, objective/module completion with auto-cascade, and allow learning objectives to exist at the path level (not just modules) with the ability to assign/remove from modules.

**Architecture:** Migration makes `module_id` nullable and adds `path_id` FK on `learning_objectives`, plus `completed`/`reviewed` booleans. Client-side mutation callbacks handle auto-completion cascade. UI adds toggle controls and a "move to module" / "remove from module" action per objective.

**Tech Stack:** Supabase migrations, React Query v5 mutations, shadcn/ui, Tailwind CSS, Vitest

---

## Context for the Engineer

### Project Structure
- Migrations: `supabase/migrations/`
- Pages: `app/app/(protected)/paths/`
- Components: `app/app/components/paths/`
- Hooks: `app/lib/hooks/`
- Types (auto-generated, don't edit): `app/types/database.ts`
- Tests: `app/__tests__/`

### Key Files to Reference
- **Existing hooks:** `app/lib/hooks/use-learning-paths.ts`, `use-modules.ts`, `use-objectives.ts`, `use-resources.ts`
- **Existing components:** `ObjectiveList.tsx`, `ResourceList.tsx`, `ModuleAccordion.tsx`, `PathHeader.tsx`
- **Detail page:** `app/app/(protected)/paths/[id]/page.tsx`
- **DB schema:** `supabase/migrations/20260129000000_initial_schema.sql`

### Database Schema (current)
```sql
learning_objectives: id, module_id(FK NOT NULL), title, description, depth_level, created_at, updated_at
resources: id, objective_id(FK), title, url, type, why_relevant, specific_context, created_at
modules: id, path_id, title, description, status, created_at, updated_at
```

### Objective Ownership Rules (after migration)
- `path_id IS NOT NULL` always — every objective belongs to a path
- `module_id` is nullable — if set, objective is inside that module; if null, objective is at path level
- An objective can be moved between modules or detached to path level

### Auto-Completion Cascade
```
Resource marked reviewed
  → If ALL resources for that objective are reviewed → auto-complete objective
    → If ALL objectives in that module are completed → auto-complete module
```
Users can manually complete at any level. Completing an objective with unreviewed resources shows a warning.

---

## Task 1: Database Migration — Add Completion/Review Columns + Flexible Objectives

**Files:**
- Create: `supabase/migrations/20260130000000_completion_tracking.sql`
- Modify: `app/types/database.ts` (manual update if supabase gen types unavailable)

**Step 1: Write the migration**

Create `supabase/migrations/20260130000000_completion_tracking.sql`:

```sql
-- Add completion/review tracking
ALTER TABLE resources ADD COLUMN reviewed BOOLEAN DEFAULT FALSE;
ALTER TABLE learning_objectives ADD COLUMN completed BOOLEAN DEFAULT FALSE;
ALTER TABLE modules ADD COLUMN completed BOOLEAN DEFAULT FALSE;

-- Make module_id nullable (objectives can live at path level)
ALTER TABLE learning_objectives ALTER COLUMN module_id DROP NOT NULL;

-- Add path_id to objectives (every objective belongs to a path)
ALTER TABLE learning_objectives ADD COLUMN path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE;

-- Backfill path_id from existing module relationships
UPDATE learning_objectives
SET path_id = modules.path_id
FROM modules
WHERE learning_objectives.module_id = modules.id;

-- Now make path_id NOT NULL
ALTER TABLE learning_objectives ALTER COLUMN path_id SET NOT NULL;

-- Index for path-level objectives
CREATE INDEX idx_objectives_path_id ON learning_objectives(path_id);

-- Update RLS policy to use path_id directly (simpler, more efficient)
DROP POLICY IF EXISTS "Users can CRUD own objectives" ON learning_objectives;
CREATE POLICY "Users can CRUD own objectives"
  ON learning_objectives FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE learning_paths.id = learning_objectives.path_id
      AND learning_paths.user_id = auth.uid()
    )
  );
```

**Step 2: Update database types**

Run `npx supabase gen types typescript --local > types/database.ts` if local Supabase is running. Otherwise, manually update `app/types/database.ts` to add:
- `resources.Row`: `reviewed: boolean`
- `learning_objectives.Row`: `completed: boolean`, `path_id: string`, `module_id: string | null`
- `learning_objectives.Insert`: `path_id: string`, `module_id?: string | null`
- `modules.Row`: `completed: boolean`

**Step 3: Commit**

```bash
git add supabase/migrations/20260130000000_completion_tracking.sql app/types/database.ts
git commit -m "feat(db): add completion tracking and make objectives flexible (path or module level)"
```

---

## Task 2: Update Resource Hook — Add Toggle Reviewed

**Files:**
- Modify: `app/lib/hooks/use-resources.ts`

**Step 1: Add useToggleResourceReviewed**

Append to `app/lib/hooks/use-resources.ts`:

```typescript
export function useToggleResourceReviewed(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reviewed }: { id: string; reviewed: boolean }) => {
      const { data, error } = await supabase
        .from('resources')
        .update({ reviewed })
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
```

**Step 2: Build**

```bash
cd app && npm run build
```

**Step 3: Commit**

```bash
git add app/lib/hooks/use-resources.ts
git commit -m "feat(data): add useToggleResourceReviewed hook"
```

---

## Task 3: Update Objective Hook — Add Toggle Completed + Move Module

**Files:**
- Modify: `app/lib/hooks/use-objectives.ts`

**Step 1: Add two new hooks**

Append to `app/lib/hooks/use-objectives.ts`:

```typescript
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
```

Also update `useCreateObjective` to accept `path_id` and optional `module_id`:

Replace the existing `useCreateObjective`:

```typescript
export function useCreateObjective(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objective: { title: string; description?: string | null; depth_level?: string; module_id?: string | null }) => {
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
```

**Step 2: Build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/lib/hooks/use-objectives.ts
git commit -m "feat(data): add objective completion toggle and move-to-module hooks"
```

---

## Task 4: Update Module Hook — Add Toggle Completed

**Files:**
- Modify: `app/lib/hooks/use-modules.ts`

**Step 1: Add useToggleModuleCompleted**

Append to `app/lib/hooks/use-modules.ts`:

```typescript
export function useToggleModuleCompleted(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('modules')
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
```

**Step 2: Build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/lib/hooks/use-modules.ts
git commit -m "feat(data): add useToggleModuleCompleted hook"
```

---

## Task 5: Update Path Detail Query — Include Path-Level Objectives

**Files:**
- Modify: `app/lib/hooks/use-learning-paths.ts`

**Step 1: Update useLearningPath to also fetch path-level objectives**

Replace the `useLearningPath` function:

```typescript
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
```

**Step 2: Build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/lib/hooks/use-learning-paths.ts
git commit -m "feat(data): include path-level objectives in detail query"
```

---

## Task 6: Update ResourceList — Add Review Toggle

**Files:**
- Modify: `app/app/components/paths/ResourceList.tsx`

**Step 1: Replace ResourceList with review toggle support**

Replace `app/app/components/paths/ResourceList.tsx`:

```tsx
'use client';

import { ExternalLink, Trash2, Video, FileText, BookOpen, GraduationCap, ScrollText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteResource, useToggleResourceReviewed } from '@/lib/hooks/use-resources';
import { Database } from '@/types/database';

type Resource = Database['public']['Tables']['resources']['Row'];

const TYPE_ICONS: Record<string, typeof Video> = {
  video: Video,
  article: FileText,
  book: BookOpen,
  course: GraduationCap,
  paper: ScrollText,
};

interface ResourceListProps {
  resources: Resource[];
  pathId: string;
  onAllReviewed?: () => void;
}

export function ResourceList({ resources, pathId, onAllReviewed }: ResourceListProps) {
  const deleteResource = useDeleteResource(pathId);
  const toggleReviewed = useToggleResourceReviewed(pathId);

  if (resources.length === 0) return null;

  function handleToggleReviewed(resource: Resource) {
    const newReviewed = !resource.reviewed;
    toggleReviewed.mutate(
      { id: resource.id, reviewed: newReviewed },
      {
        onSuccess: () => {
          if (newReviewed) {
            const allOthersReviewed = resources
              .filter((r) => r.id !== resource.id)
              .every((r) => r.reviewed);
            if (allOthersReviewed && onAllReviewed) {
              onAllReviewed();
            }
          }
        },
      }
    );
  }

  const reviewedCount = resources.filter((r) => r.reviewed).length;

  return (
    <div className="space-y-2 mt-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
        <span className="text-[10px] text-muted-foreground">
          {reviewedCount}/{resources.length} reviewed
        </span>
      </div>
      {resources.map((resource) => {
        const Icon = TYPE_ICONS[resource.type] ?? FileText;
        return (
          <div
            key={resource.id}
            className={`flex items-start gap-3 rounded-lg p-3 group transition-colors ${
              resource.reviewed ? 'bg-[var(--status-resting)]/8' : 'bg-muted/30'
            }`}
          >
            <button
              onClick={() => handleToggleReviewed(resource)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                resource.reviewed
                  ? 'bg-[var(--status-resting)]/20 text-[var(--status-resting)]'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              title={resource.reviewed ? 'Mark as unread' : 'Mark as reviewed'}
            >
              {resource.reviewed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-medium hover:text-[var(--amber)] transition-colors inline-flex items-center gap-1 ${
                  resource.reviewed ? 'line-through opacity-60' : ''
                }`}
              >
                {resource.title}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {resource.why_relevant}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8 p-0"
              onClick={() => deleteResource.mutate(resource.id)}
              title="Remove resource"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: Build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/app/components/paths/ResourceList.tsx
git commit -m "feat(paths): add resource review toggle with progress counter"
```

---

## Task 7: Update ObjectiveList — Completion Toggle + Warning + Move Module

**Files:**
- Modify: `app/app/components/paths/ObjectiveList.tsx`

**Step 1: Replace ObjectiveList with completion + move-to-module support**

Replace `app/app/components/paths/ObjectiveList.tsx`:

```tsx
'use client';

import { Target, Plus, Trash2, CheckCircle2, Circle, AlertTriangle, ArrowRightLeft } from 'lucide-react';
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
import { useDeleteObjective, useToggleObjectiveCompleted, useMoveObjectiveToModule } from '@/lib/hooks/use-objectives';
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
}

export function ObjectiveList({ objectives, pathId, moduleId, modules, onAllCompleted }: ObjectiveListProps) {
  const deleteObjective = useDeleteObjective(pathId);
  const toggleCompleted = useToggleObjectiveCompleted(pathId);
  const moveObjective = useMoveObjectiveToModule(pathId);
  const [warningObjectiveId, setWarningObjectiveId] = useState<string | null>(null);
  const [movingObjectiveId, setMovingObjectiveId] = useState<string | null>(null);

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

      {objectives.map((obj) => (
        <div
          key={obj.id}
          className={`rounded-lg border p-4 group/obj transition-colors ${
            obj.completed
              ? 'border-[var(--status-resting)]/30 bg-[var(--status-resting)]/5'
              : 'border-border/30 bg-card/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
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
                  <span className={`text-sm font-medium ${obj.completed ? 'line-through opacity-60' : ''}`}>
                    {obj.title}
                  </span>
                  <DepthBadge depth={obj.depth_level as 'survey' | 'intermediate' | 'deep'} />
                </div>
                {obj.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {obj.description}
                  </p>
                )}
                <ResourceList
                  resources={obj.resources}
                  pathId={pathId}
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
                />
                <div className="flex items-center gap-3 mt-2">
                  <AddResourceDialog pathId={pathId} objectiveId={obj.id}>
                    <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Plus className="h-3 w-3" />
                      Add resource
                    </button>
                  </AddResourceDialog>
                  {modules && modules.length > 0 && (
                    movingObjectiveId === obj.id ? (
                      <div className="flex items-center gap-1">
                        <Select onValueChange={(val) => handleMoveToModule(obj.id, val)}>
                          <SelectTrigger className="h-6 text-[10px] w-36">
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
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                        Move
                      </button>
                    )
                  )}
                </div>
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
```

**Step 2: Update CreateObjectiveDialog to accept `moduleId: string | null`**

In `app/app/components/paths/CreateObjectiveDialog.tsx`, change the interface and mutation call:

```tsx
interface CreateObjectiveDialogProps {
  pathId: string;
  moduleId: string | null;
  children: React.ReactNode;
}
```

And in `handleSubmit`, change the mutate call:

```tsx
createObjective.mutate(
  {
    module_id: moduleId,
    title: title.trim(),
    description: description.trim() || null,
    depth_level: depth,
  },
  { onSuccess: () => { setOpen(false); setTitle(''); setDescription(''); setDepth('survey'); } }
);
```

**Step 3: Build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add app/app/components/paths/ObjectiveList.tsx app/app/components/paths/CreateObjectiveDialog.tsx
git commit -m "feat(paths): add objective completion, review warning, and move-to-module"
```

---

## Task 8: Update ModuleAccordion — Completion Toggle & Progress

**Files:**
- Modify: `app/app/components/paths/ModuleAccordion.tsx`

**Step 1: Replace ModuleAccordion with completion support**

Replace `app/app/components/paths/ModuleAccordion.tsx`:

```tsx
'use client';

import { Layers, Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
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
import { useDeleteModule, useToggleModuleCompleted } from '@/lib/hooks/use-modules';
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
```

**Step 2: Build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/app/components/paths/ModuleAccordion.tsx
git commit -m "feat(paths): add module completion toggle with objective progress"
```

---

## Task 9: Update Path Detail Page — Show Path-Level Objectives

**Files:**
- Modify: `app/app/(protected)/paths/[id]/page.tsx`

**Step 1: Update detail page to show path-level objectives section**

Replace `app/app/(protected)/paths/[id]/page.tsx`:

```tsx
'use client';

import { use } from 'react';
import * as motion from 'motion/react-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useLearningPath } from '@/lib/hooks/use-learning-paths';
import { PathHeader } from '@/app/components/paths/PathHeader';
import { ModuleAccordion } from '@/app/components/paths/ModuleAccordion';
import { ObjectiveList } from '@/app/components/paths/ObjectiveList';
import { Target } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

export default function PathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: path, isLoading, error } = useLearningPath(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-3 mt-8">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm">
            {error ? 'Failed to load this learning path.' : 'Learning path not found.'}
          </p>
        </div>
      </div>
    );
  }

  const pathObjectives = (path as any).pathObjectives ?? [];
  const modules = path.modules ?? [];
  const moduleRefs = modules.map((m: any) => ({ id: m.id, title: m.title }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="space-y-8 max-w-4xl"
    >
      <PathHeader path={path} />

      {/* Path-level objectives */}
      {(pathObjectives.length > 0 || true) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15, ease }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--amber)]" />
              <h2 className="text-lg font-display font-semibold">Path Objectives</h2>
            </div>
            <ObjectiveList
              objectives={pathObjectives}
              pathId={path.id}
              moduleId={null}
              modules={moduleRefs}
            />
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25, ease }}
      >
        <ModuleAccordion modules={modules} pathId={path.id} />
      </motion.div>
    </motion.div>
  );
}
```

**Step 2: Build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add "app/app/(protected)/paths/[id]/page.tsx"
git commit -m "feat(paths): show path-level objectives section in detail page"
```

---

## Task 10: Run All Tests & Final Build

**Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass. If any test fails due to the new `completed`/`reviewed`/`module_id` nullable changes, update mock data to include these fields.

**Step 2: Full build**

```bash
npm run build
```

**Step 3: Commit any fixes**

```bash
git status
```

---

## Summary

| Task | What | Files | Commit |
|------|------|-------|--------|
| 1 | Migration: completion columns + flexible objectives | 1 migration + types | `feat(db): add completion tracking and flexible objectives` |
| 2 | useToggleResourceReviewed | 1 hook | `feat(data): add useToggleResourceReviewed` |
| 3 | useToggleObjectiveCompleted + useMoveObjectiveToModule + update useCreateObjective | 1 hook | `feat(data): add objective completion and move hooks` |
| 4 | useToggleModuleCompleted | 1 hook | `feat(data): add useToggleModuleCompleted` |
| 5 | Update path detail query | 1 hook | `feat(data): include path-level objectives in query` |
| 6 | ResourceList — review toggle | 1 component | `feat(paths): add resource review toggle` |
| 7 | ObjectiveList — completion + warning + move | 2 components | `feat(paths): add objective completion and move-to-module` |
| 8 | ModuleAccordion — completion + progress | 1 component | `feat(paths): add module completion toggle` |
| 9 | Path detail page — path objectives section | 1 page | `feat(paths): show path-level objectives` |
| 10 | Test & build verification | — | — |

**Total: 10 tasks, ~10 files, 9 commits**
