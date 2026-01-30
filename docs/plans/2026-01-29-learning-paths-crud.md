# Learning Paths CRUD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build fully functional Learning Paths list and detail pages with CRUD for paths, modules, objectives, and resources — connected to Supabase via React Query.

**Architecture:** Two pages (`/paths` list, `/paths/[id]` detail) with shared UI components. Data flows through React Query hooks → Supabase client → Postgres with RLS. Modules use accordion expand pattern; objectives and resources nest inside. All forms use shadcn Dialog.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (client SDK + RLS), React Query v5, shadcn/ui, Tailwind CSS 4, Vitest + @testing-library/react

---

## Context for the Engineer

### Project Structure
- Pages live in `app/app/(protected)/paths/`
- Components live in `app/app/components/paths/`
- Hooks live in `app/lib/hooks/`
- shadcn components live in `app/components/ui/`
- Tests live in `app/__tests__/`
- Database types: `app/types/database.ts` (auto-generated, don't edit)

### Key Files to Reference
- **Existing hooks pattern:** `app/lib/hooks/use-learning-paths.ts`
- **Supabase client:** `app/lib/supabase/client.ts`
- **Design system:** `app/app/globals.css` (shadow-warm, gradient-warm, status colors)
- **Dashboard for UI patterns:** `app/app/(protected)/dashboard/page.tsx`
- **Sidebar nav:** `app/app/components/AppSidebar.tsx` (already has `/paths` link)
- **DB schema:** `supabase/migrations/20260129000000_initial_schema.sql`

### Design System Tokens
```
Status colors: var(--status-exploring), var(--status-deepening), var(--status-resting), var(--status-not-started)
Node colors: var(--node-objective), var(--node-project), var(--node-idea), var(--node-concept)
Warm accents: var(--amber), var(--amber-light), var(--coral)
Classes: shadow-warm, shadow-warm-lg, gradient-warm, text-gradient-warm
Font: font-display for headings, default for body
```

### Database Schema (relevant tables)
```sql
-- learning_paths: id, user_id, title, description, status('active'|'resting'), created_at, updated_at
-- modules: id, path_id(FK), title, description, status('not_started'|'exploring'|'deepening'|'resting'), created_at, updated_at
-- module_dependencies: id, module_id(FK), prerequisite_module_id(FK)
-- learning_objectives: id, module_id(FK), title, description, depth_level('survey'|'intermediate'|'deep'), created_at, updated_at
-- resources: id, objective_id(FK), title, url, type('video'|'article'|'book'|'course'|'paper'), why_relevant, specific_context(JSONB), created_at
```

### Mocking Pattern for Tests
All test files must mock `motion/react-client`, `motion/react`, `next/link`, and `next/navigation`. See `app/__tests__/dashboard.test.tsx` for the established pattern.

For hooks tests, mock `@/lib/supabase/client` to return a fake Supabase client.

---

## Task 1: Install shadcn UI Components

**Files:**
- Create: `app/components/ui/accordion.tsx`
- Create: `app/components/ui/badge.tsx`
- Create: `app/components/ui/select.tsx`
- Create: `app/components/ui/label.tsx`
- Create: `app/components/ui/textarea.tsx`
- Create: `app/components/ui/alert-dialog.tsx`

**Step 1: Install all 6 components**

```bash
cd app
npx shadcn@latest add accordion badge select label textarea alert-dialog
```

Accept defaults for all prompts. This creates the files in `app/components/ui/`.

**Step 2: Verify build**

```bash
npm run build
```

Expected: Compiles successfully.

**Step 3: Commit**

```bash
git add app/components/ui/accordion.tsx app/components/ui/badge.tsx app/components/ui/select.tsx app/components/ui/label.tsx app/components/ui/textarea.tsx app/components/ui/alert-dialog.tsx app/package.json app/package-lock.json
git commit -m "feat(ui): install shadcn accordion, badge, select, label, textarea, alert-dialog"
```

---

## Task 2: Data Hooks — Modules CRUD

**Files:**
- Create: `app/lib/hooks/use-modules.ts`
- Create: `app/__tests__/hooks/use-modules.test.ts`
- Modify: `app/lib/hooks/use-learning-paths.ts` (add useDeleteLearningPath)

**Step 1: Add useDeleteLearningPath to existing hooks**

In `app/lib/hooks/use-learning-paths.ts`, add after `useUpdateLearningPath`:

```typescript
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
```

**Step 2: Create use-modules.ts**

Create `app/lib/hooks/use-modules.ts`:

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ModuleInsert = Database['public']['Tables']['modules']['Insert'];
type ModuleUpdate = Database['public']['Tables']['modules']['Update'];

export function useCreateModule() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (module: Omit<ModuleInsert, 'id'>) => {
      const { data, error } = await supabase
        .from('modules')
        .insert(module)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths', variables.path_id] });
    },
  });
}

export function useUpdateModule(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ModuleUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('modules')
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

export function useDeleteModule(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths', pathId] });
    },
  });
}
```

**Step 3: Build to verify types**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add app/lib/hooks/use-learning-paths.ts app/lib/hooks/use-modules.ts
git commit -m "feat(data): add module CRUD hooks and useDeleteLearningPath"
```

---

## Task 3: Data Hooks — Objectives & Resources CRUD

**Files:**
- Create: `app/lib/hooks/use-objectives.ts`
- Create: `app/lib/hooks/use-resources.ts`

**Step 1: Create use-objectives.ts**

Create `app/lib/hooks/use-objectives.ts`:

```typescript
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
    mutationFn: async (objective: Omit<ObjectiveInsert, 'id'>) => {
      const { data, error } = await supabase
        .from('learning_objectives')
        .insert(objective)
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
```

**Step 2: Create use-resources.ts**

Create `app/lib/hooks/use-resources.ts`:

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type ResourceInsert = Database['public']['Tables']['resources']['Insert'];

export function useCreateResource(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: Omit<ResourceInsert, 'id'>) => {
      const { data, error } = await supabase
        .from('resources')
        .insert(resource)
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

export function useDeleteResource(pathId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths', pathId] });
    },
  });
}
```

**Step 3: Build to verify types**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add app/lib/hooks/use-objectives.ts app/lib/hooks/use-resources.ts
git commit -m "feat(data): add objective and resource CRUD hooks"
```

---

## Task 4: Shared UI Components — StatusBadge, DepthBadge, EmptyState

**Files:**
- Create: `app/app/components/paths/StatusBadge.tsx`
- Create: `app/app/components/paths/DepthBadge.tsx`
- Create: `app/app/components/paths/EmptyState.tsx`
- Create: `app/__tests__/paths/shared-components.test.tsx`

**Step 1: Create StatusBadge**

Create `app/app/components/paths/StatusBadge.tsx`:

```tsx
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-[var(--status-exploring)]/15 text-[var(--status-exploring)] border-[var(--status-exploring)]/30' },
  resting: { label: 'Resting', className: 'bg-[var(--status-resting)]/15 text-[var(--status-resting)] border-[var(--status-resting)]/30' },
  not_started: { label: 'Not started', className: 'bg-muted text-muted-foreground border-border' },
  exploring: { label: 'Exploring', className: 'bg-[var(--status-exploring)]/15 text-[var(--status-exploring)] border-[var(--status-exploring)]/30' },
  deepening: { label: 'Deepening', className: 'bg-[var(--status-deepening)]/15 text-[var(--status-deepening)] border-[var(--status-deepening)]/30' },
} as const;

type Status = keyof typeof STATUS_CONFIG;

export function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${config.className}`}>
      {config.label}
    </Badge>
  );
}
```

**Step 2: Create DepthBadge**

Create `app/app/components/paths/DepthBadge.tsx`:

```tsx
import { Badge } from '@/components/ui/badge';

const DEPTH_CONFIG = {
  survey: { label: 'Survey', className: 'bg-muted text-muted-foreground border-border' },
  intermediate: { label: 'Intermediate', className: 'bg-[var(--status-deepening)]/15 text-[var(--status-deepening)] border-[var(--status-deepening)]/30' },
  deep: { label: 'Deep', className: 'bg-[var(--amber)]/15 text-[var(--amber)] border-[var(--amber)]/30' },
} as const;

type Depth = keyof typeof DEPTH_CONFIG;

export function DepthBadge({ depth }: { depth: Depth }) {
  const config = DEPTH_CONFIG[depth];
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${config.className}`}>
      {config.label}
    </Badge>
  );
}
```

**Step 3: Create EmptyState**

Create `app/app/components/paths/EmptyState.tsx`:

```tsx
import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, iconColor = 'var(--amber)', title, description, children }: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[var(--amber-light)]/20 via-card to-card p-10 text-center shadow-warm border border-border/30">
      <div className="flex justify-center mb-5">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
          style={{ background: `color-mix(in oklch, ${iconColor}, transparent 88%)` }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-base font-display font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-[320px] mx-auto leading-relaxed">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
```

**Step 4: Write tests**

Create `app/__tests__/paths/shared-components.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/app/components/paths/StatusBadge';
import { DepthBadge } from '@/app/components/paths/DepthBadge';
import { EmptyState } from '@/app/components/paths/EmptyState';
import { Compass } from 'lucide-react';

describe('StatusBadge', () => {
  it('renders active status with correct label', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders resting status', () => {
    render(<StatusBadge status="resting" />);
    expect(screen.getByText('Resting')).toBeInTheDocument();
  });

  it('renders exploring status', () => {
    render(<StatusBadge status="exploring" />);
    expect(screen.getByText('Exploring')).toBeInTheDocument();
  });

  it('renders deepening status', () => {
    render(<StatusBadge status="deepening" />);
    expect(screen.getByText('Deepening')).toBeInTheDocument();
  });

  it('renders not_started status', () => {
    render(<StatusBadge status="not_started" />);
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });
});

describe('DepthBadge', () => {
  it('renders survey depth', () => {
    render(<DepthBadge depth="survey" />);
    expect(screen.getByText('Survey')).toBeInTheDocument();
  });

  it('renders intermediate depth', () => {
    render(<DepthBadge depth="intermediate" />);
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
  });

  it('renders deep depth', () => {
    render(<DepthBadge depth="deep" />);
    expect(screen.getByText('Deep')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(
      <EmptyState
        icon={Compass}
        title="No paths yet"
        description="Start your first learning journey"
      />
    );
    expect(screen.getByText('No paths yet')).toBeInTheDocument();
    expect(screen.getByText('Start your first learning journey')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <EmptyState icon={Compass} title="Empty" description="Desc">
        <button>Create</button>
      </EmptyState>
    );
    expect(screen.getByText('Create')).toBeInTheDocument();
  });
});
```

**Step 5: Run tests**

```bash
npx vitest run __tests__/paths/shared-components.test.tsx
```

Expected: All 10 tests pass.

**Step 6: Commit**

```bash
git add app/app/components/paths/StatusBadge.tsx app/app/components/paths/DepthBadge.tsx app/app/components/paths/EmptyState.tsx app/__tests__/paths/shared-components.test.tsx
git commit -m "feat(paths): add StatusBadge, DepthBadge, and EmptyState components"
```

---

## Task 5: Create Path Dialog & Path Card

**Files:**
- Create: `app/app/components/paths/CreatePathDialog.tsx`
- Create: `app/app/components/paths/PathCard.tsx`
- Create: `app/__tests__/paths/path-card.test.tsx`

**Step 1: Create CreatePathDialog**

Create `app/app/components/paths/CreatePathDialog.tsx`:

```tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateLearningPath } from '@/lib/hooks/use-learning-paths';

interface CreatePathDialogProps {
  children: React.ReactNode;
}

export function CreatePathDialog({ children }: CreatePathDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createPath = useCreateLearningPath();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createPath.mutate(
      { title: title.trim(), description: description.trim() || null },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setDescription('');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Create Learning Path</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="path-title">Title</Label>
            <Input
              id="path-title"
              placeholder="e.g., Machine Learning Foundations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="path-description">Description (optional)</Label>
            <Textarea
              id="path-description"
              placeholder="What do you want to explore?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createPath.isPending}
              className="gradient-warm text-primary-foreground border-0"
            >
              {createPath.isPending ? 'Creating...' : 'Create Path'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Create PathCard**

Create `app/app/components/paths/PathCard.tsx`:

```tsx
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Database } from '@/types/database';

type LearningPath = Database['public']['Tables']['learning_paths']['Row'];

interface PathCardProps {
  path: LearningPath & {
    modules?: { id: string }[];
  };
}

export function PathCard({ path }: PathCardProps) {
  const moduleCount = path.modules?.length ?? 0;
  const updatedAt = new Date(path.updated_at!).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/paths/${path.id}`} className="group block">
      <div className="rounded-xl bg-card p-5 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 border border-border/30">
        <div className="flex items-start justify-between mb-3">
          <StatusBadge status={path.status as 'active' | 'resting'} />
          <span className="text-[11px] text-muted-foreground">{updatedAt}</span>
        </div>
        <h3 className="text-base font-display font-semibold leading-snug mb-1.5 group-hover:text-[var(--amber)] transition-colors">
          {path.title}
        </h3>
        {path.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {path.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-[var(--amber)] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
```

**Step 3: Write PathCard tests**

Create `app/__tests__/paths/path-card.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { PathCard } from '@/app/components/paths/PathCard';

const mockPath = {
  id: '123',
  user_id: 'user-1',
  title: 'Machine Learning Basics',
  description: 'An introduction to ML concepts',
  status: 'active',
  created_at: '2026-01-28T00:00:00Z',
  updated_at: '2026-01-29T00:00:00Z',
  modules: [{ id: 'm1' }, { id: 'm2' }],
};

describe('PathCard', () => {
  it('renders path title', () => {
    render(<PathCard path={mockPath} />);
    expect(screen.getByText('Machine Learning Basics')).toBeInTheDocument();
  });

  it('renders path description', () => {
    render(<PathCard path={mockPath} />);
    expect(screen.getByText('An introduction to ML concepts')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<PathCard path={mockPath} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders module count', () => {
    render(<PathCard path={mockPath} />);
    expect(screen.getByText('2 modules')).toBeInTheDocument();
  });

  it('links to path detail page', () => {
    render(<PathCard path={mockPath} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/paths/123');
  });

  it('renders singular "module" for count of 1', () => {
    render(<PathCard path={{ ...mockPath, modules: [{ id: 'm1' }] }} />);
    expect(screen.getByText('1 module')).toBeInTheDocument();
  });

  it('has shadow-warm class for warm elevation', () => {
    render(<PathCard path={mockPath} />);
    const card = screen.getByRole('link').firstChild as HTMLElement;
    expect(card.className).toContain('shadow-warm');
  });
});
```

**Step 4: Run tests**

```bash
npx vitest run __tests__/paths/path-card.test.tsx
```

Expected: All 7 tests pass.

**Step 5: Build**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add app/app/components/paths/CreatePathDialog.tsx app/app/components/paths/PathCard.tsx app/__tests__/paths/path-card.test.tsx
git commit -m "feat(paths): add CreatePathDialog and PathCard components"
```

---

## Task 6: Paths List Page

**Files:**
- Modify: `app/app/(protected)/paths/page.tsx`
- Create: `app/__tests__/paths/paths-page.test.tsx`

**Step 1: Implement the paths list page**

Replace `app/app/(protected)/paths/page.tsx` with:

```tsx
'use client';

import * as motion from 'motion/react-client';
import { Sparkles, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLearningPaths } from '@/lib/hooks/use-learning-paths';
import { PathCard } from '@/app/components/paths/PathCard';
import { EmptyState } from '@/app/components/paths/EmptyState';
import { CreatePathDialog } from '@/app/components/paths/CreatePathDialog';

const ease = [0.22, 1, 0.36, 1] as const;

export default function PathsPage() {
  const { data: paths, isLoading, error } = useLearningPaths();

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--amber)] mb-3">
          Learning Paths
        </p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold tracking-tight">
              Your{' '}
              <span className="text-gradient-warm">explorations</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-lg">
              Each path is a journey of discovery. No deadlines, no pressure — just curiosity.
            </p>
          </div>
          {paths && paths.length > 0 && (
            <CreatePathDialog>
              <Button className="gradient-warm text-primary-foreground border-0 shadow-warm">
                <Plus className="h-4 w-4 mr-2" />
                New Path
              </Button>
            </CreatePathDialog>
          )}
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-[var(--amber)]/30 via-border/40 to-transparent" />
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm">Failed to load your learning paths. Please try again.</p>
        </div>
      ) : paths && paths.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
          className="grid md:grid-cols-2 gap-4"
        >
          {paths.map((path, i) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05, ease }}
            >
              <PathCard path={path} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
        >
          <EmptyState
            icon={BookOpen}
            title="No learning paths yet"
            description="Start a conversation with the AI to co-design your first learning journey, or create one manually."
          >
            <CreatePathDialog>
              <Button className="gradient-warm text-primary-foreground border-0 shadow-warm hover:shadow-warm-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Create your first path
              </Button>
            </CreatePathDialog>
          </EmptyState>
        </motion.div>
      )}
    </div>
  );
}
```

**Step 2: Build to verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add "app/app/(protected)/paths/page.tsx"
git commit -m "feat(paths): build learning paths list page with cards and empty state"
```

---

## Task 7: Path Detail — Module Accordion & Dialogs

**Files:**
- Create: `app/app/components/paths/PathHeader.tsx`
- Create: `app/app/components/paths/ModuleAccordion.tsx`
- Create: `app/app/components/paths/ObjectiveList.tsx`
- Create: `app/app/components/paths/ResourceList.tsx`
- Create: `app/app/components/paths/CreateModuleDialog.tsx`
- Create: `app/app/components/paths/CreateObjectiveDialog.tsx`
- Create: `app/app/components/paths/AddResourceDialog.tsx`

**Step 1: Create PathHeader**

Create `app/app/components/paths/PathHeader.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Bed, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from './StatusBadge';
import { useUpdateLearningPath, useDeleteLearningPath } from '@/lib/hooks/use-learning-paths';
import { Database } from '@/types/database';

type LearningPath = Database['public']['Tables']['learning_paths']['Row'];

interface PathHeaderProps {
  path: LearningPath;
}

export function PathHeader({ path }: PathHeaderProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(path.title);
  const [description, setDescription] = useState(path.description ?? '');
  const updatePath = useUpdateLearningPath();
  const deletePath = useDeleteLearningPath();

  function handleSave() {
    if (!title.trim()) return;
    updatePath.mutate(
      { id: path.id, title: title.trim(), description: description.trim() || null },
      { onSuccess: () => setEditing(false) }
    );
  }

  function handleToggleStatus() {
    const newStatus = path.status === 'active' ? 'resting' : 'active';
    updatePath.mutate({ id: path.id, status: newStatus });
  }

  function handleDelete() {
    deletePath.mutate(path.id, {
      onSuccess: () => router.push('/paths'),
    });
  }

  return (
    <div className="space-y-4">
      <Link
        href="/paths"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All paths
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-display font-bold"
                autoFocus
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this learning path..."
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={!title.trim() || updatePath.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setTitle(path.title); setDescription(path.description ?? ''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={path.status as 'active' | 'resting'} />
              </div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
                {path.title}
              </h1>
              {path.description && (
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed max-w-2xl">
                  {path.description}
                </p>
              )}
            </>
          )}
        </div>

        {!editing && (
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToggleStatus} title={path.status === 'active' ? 'Rest this path' : 'Resume this path'}>
              {path.status === 'active' ? <Bed className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" title="Delete path">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this learning path?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{path.title}&quot; and all its modules, objectives, and resources. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-[var(--amber)]/30 via-border/40 to-transparent" />
    </div>
  );
}
```

**Step 2: Create CreateModuleDialog**

Create `app/app/components/paths/CreateModuleDialog.tsx`:

```tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateModule } from '@/lib/hooks/use-modules';

interface CreateModuleDialogProps {
  pathId: string;
  children: React.ReactNode;
}

export function CreateModuleDialog({ pathId, children }: CreateModuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createModule = useCreateModule();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createModule.mutate(
      { path_id: pathId, title: title.trim(), description: description.trim() || null },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setDescription('');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Module</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="module-title">Title</Label>
            <Input
              id="module-title"
              placeholder="e.g., Neural Network Fundamentals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="module-description">Description (optional)</Label>
            <Textarea
              id="module-description"
              placeholder="What does this module cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || createModule.isPending}>
              {createModule.isPending ? 'Adding...' : 'Add Module'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: Create CreateObjectiveDialog**

Create `app/app/components/paths/CreateObjectiveDialog.tsx`:

```tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateObjective } from '@/lib/hooks/use-objectives';

interface CreateObjectiveDialogProps {
  pathId: string;
  moduleId: string;
  children: React.ReactNode;
}

export function CreateObjectiveDialog({ pathId, moduleId, children }: CreateObjectiveDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [depth, setDepth] = useState<string>('survey');
  const createObjective = useCreateObjective(pathId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createObjective.mutate(
      {
        module_id: moduleId,
        title: title.trim(),
        description: description.trim() || null,
        depth_level: depth,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setDescription('');
          setDepth('survey');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Learning Objective</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="obj-title">Title</Label>
            <Input
              id="obj-title"
              placeholder="e.g., Understand backpropagation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obj-description">Description (optional)</Label>
            <Textarea
              id="obj-description"
              placeholder="What specifically should you learn?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Depth Level</Label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="survey">Survey — get the lay of the land</SelectItem>
                <SelectItem value="intermediate">Intermediate — working knowledge</SelectItem>
                <SelectItem value="deep">Deep — expert-level mastery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || createObjective.isPending}>
              {createObjective.isPending ? 'Adding...' : 'Add Objective'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 4: Create AddResourceDialog**

Create `app/app/components/paths/AddResourceDialog.tsx`:

```tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateResource } from '@/lib/hooks/use-resources';

interface AddResourceDialogProps {
  pathId: string;
  objectiveId: string;
  children: React.ReactNode;
}

export function AddResourceDialog({ pathId, objectiveId, children }: AddResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<string>('article');
  const [whyRelevant, setWhyRelevant] = useState('');
  const createResource = useCreateResource(pathId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !whyRelevant.trim()) return;

    createResource.mutate(
      {
        objective_id: objectiveId,
        title: title.trim(),
        url: url.trim(),
        type,
        why_relevant: whyRelevant.trim(),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setUrl('');
          setType('article');
          setWhyRelevant('');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="res-title">Title</Label>
            <Input
              id="res-title"
              placeholder="e.g., 3Blue1Brown Neural Networks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="res-url">URL</Label>
            <Input
              id="res-url"
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="book">Book</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="paper">Paper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="res-why">Why this resource matters</Label>
            <Textarea
              id="res-why"
              placeholder="How does this help with the learning objective?"
              value={whyRelevant}
              onChange={(e) => setWhyRelevant(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !url.trim() || !whyRelevant.trim() || createResource.isPending}>
              {createResource.isPending ? 'Adding...' : 'Add Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 5: Build to verify types**

```bash
npm run build
```

**Step 6: Commit**

```bash
git add app/app/components/paths/PathHeader.tsx app/app/components/paths/CreateModuleDialog.tsx app/app/components/paths/CreateObjectiveDialog.tsx app/app/components/paths/AddResourceDialog.tsx
git commit -m "feat(paths): add PathHeader, CreateModule, CreateObjective, AddResource dialogs"
```

---

## Task 8: Resource List & Objective List Components

**Files:**
- Create: `app/app/components/paths/ResourceList.tsx`
- Create: `app/app/components/paths/ObjectiveList.tsx`

**Step 1: Create ResourceList**

Create `app/app/components/paths/ResourceList.tsx`:

```tsx
'use client';

import { ExternalLink, Trash2, Video, FileText, BookOpen, GraduationCap, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteResource } from '@/lib/hooks/use-resources';
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
}

export function ResourceList({ resources, pathId }: ResourceListProps) {
  const deleteResource = useDeleteResource(pathId);

  if (resources.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resources</p>
      {resources.map((resource) => {
        const Icon = TYPE_ICONS[resource.type] ?? FileText;
        return (
          <div
            key={resource.id}
            className="flex items-start gap-3 rounded-lg bg-muted/30 p-3 group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-[var(--amber)] transition-colors inline-flex items-center gap-1"
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

**Step 2: Create ObjectiveList**

Create `app/app/components/paths/ObjectiveList.tsx`:

```tsx
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
```

**Step 3: Build to verify**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add app/app/components/paths/ResourceList.tsx app/app/components/paths/ObjectiveList.tsx
git commit -m "feat(paths): add ObjectiveList and ResourceList components"
```

---

## Task 9: Module Accordion Component

**Files:**
- Create: `app/app/components/paths/ModuleAccordion.tsx`

**Step 1: Create ModuleAccordion**

Create `app/app/components/paths/ModuleAccordion.tsx`:

```tsx
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
```

**Step 2: Build to verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/app/components/paths/ModuleAccordion.tsx
git commit -m "feat(paths): add ModuleAccordion component with nested objectives"
```

---

## Task 10: Path Detail Page

**Files:**
- Create: `app/app/(protected)/paths/[id]/page.tsx`
- Create: `app/__tests__/paths/path-detail.test.tsx`

**Step 1: Create the detail page**

Create `app/app/(protected)/paths/[id]/page.tsx`:

```tsx
'use client';

import { use } from 'react';
import * as motion from 'motion/react-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useLearningPath } from '@/lib/hooks/use-learning-paths';
import { PathHeader } from '@/app/components/paths/PathHeader';
import { ModuleAccordion } from '@/app/components/paths/ModuleAccordion';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="space-y-8 max-w-4xl"
    >
      <PathHeader path={path} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease }}
      >
        <ModuleAccordion modules={path.modules ?? []} pathId={path.id} />
      </motion.div>
    </motion.div>
  );
}
```

**Step 2: Build to verify**

```bash
npm run build
```

Expected: Compiles successfully. New route `/paths/[id]` appears in the route list.

**Step 3: Commit**

```bash
git add "app/app/(protected)/paths/[id]/page.tsx"
git commit -m "feat(paths): build path detail page with modules accordion"
```

---

## Task 11: Update Paths List Hook to Include Module Count

**Files:**
- Modify: `app/lib/hooks/use-learning-paths.ts`

**Step 1: Update useLearningPaths to include module count**

In `app/lib/hooks/use-learning-paths.ts`, change the `useLearningPaths` queryFn to include modules:

```typescript
export function useLearningPaths() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*, modules(id)')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
```

This fetches path rows with an array of `{ id }` for each module, giving PathCard access to `path.modules.length`.

**Step 2: Build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/lib/hooks/use-learning-paths.ts
git commit -m "feat(data): include module IDs in learning paths list query"
```

---

## Task 12: Run All Tests & Final Build

**Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass (existing + new).

**Step 2: Full build**

```bash
npm run build
```

Expected: Clean build with all routes including `/paths` and `/paths/[id]`.

**Step 3: Final commit (if any fixes needed)**

```bash
git status
```

If clean, done. If fixes were needed, commit them.

---

## Summary

| Task | What | Files | Commit |
|------|------|-------|--------|
| 1 | Install shadcn components | 6 UI components | `feat(ui): install shadcn ...` |
| 2 | Module CRUD hooks + delete path | 2 hook files | `feat(data): add module CRUD hooks` |
| 3 | Objective & Resource hooks | 2 hook files | `feat(data): add objective and resource CRUD hooks` |
| 4 | StatusBadge, DepthBadge, EmptyState | 3 components + tests | `feat(paths): add shared components` |
| 5 | CreatePathDialog, PathCard | 2 components + tests | `feat(paths): add CreatePathDialog and PathCard` |
| 6 | Paths list page | 1 page | `feat(paths): build paths list page` |
| 7 | PathHeader + 3 dialogs | 4 components | `feat(paths): add PathHeader and dialogs` |
| 8 | ObjectiveList, ResourceList | 2 components | `feat(paths): add ObjectiveList and ResourceList` |
| 9 | ModuleAccordion | 1 component | `feat(paths): add ModuleAccordion` |
| 10 | Path detail page | 1 page | `feat(paths): build path detail page` |
| 11 | Update list query | 1 hook change | `feat(data): include module IDs in list query` |
| 12 | Test & build verification | — | — |

**Total: 12 tasks, ~20 files, 12 commits**
