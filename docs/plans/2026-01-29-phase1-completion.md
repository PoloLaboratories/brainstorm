# Phase 1 Completion: Database Types + React Query + UI Shell

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire typed Supabase clients to the generated database schema, set up React Query for data fetching, and build the protected app shell (sidebar + header) with placeholder pages.

**Architecture:** Server components fetch initial data via typed Supabase. Client components use React Query hooks for mutations and reactive updates. The protected layout wraps all authenticated pages in a sidebar + header shell.

**Tech Stack:** Supabase (typed with generated `Database` type), TanStack React Query v5, shadcn/ui (sidebar, tooltip, separator), Next.js App Router, Tailwind CSS v4

---

## Pre-existing (already done)

- Database migration: `supabase/migrations/20260129000000_initial_schema.sql` (all tables + RLS + triggers)
- Migration applied: `npx supabase db reset` runs clean
- TypeScript types: `app/types/database.ts` generated (585 lines)
- Auth: login, signup, OAuth, middleware, server actions all working
- Design system: all tokens, animations, utilities in `app/app/globals.css`

---

### Task 1: Type the Supabase clients

**Files:**
- Modify: `app/lib/supabase/client.ts`
- Modify: `app/lib/supabase/server.ts`
- Modify: `app/lib/supabase/middleware.ts`

**Step 1: Add Database type to browser client**

```typescript
// app/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Add Database type to server client**

```typescript
// app/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}
```

**Step 3: Verify build**

Run: `cd app && npm run build`
Expected: No type errors

**Step 4: Commit**

```bash
git add app/lib/supabase/client.ts app/lib/supabase/server.ts app/types/database.ts
git commit -m "feat(db): type Supabase clients with generated Database schema"
```

---

### Task 2: Set up React Query provider

**Files:**
- Create: `app/app/providers.tsx`
- Modify: `app/app/layout.tsx`

**Step 1: Create providers wrapper**

```typescript
// app/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Step 2: Wrap root layout with providers**

In `app/app/layout.tsx`, wrap `{children}` with `<Providers>`:

```tsx
import { Providers } from './providers';

// ... existing font/metadata code ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakarta.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Step 3: Verify build**

Run: `cd app && npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add app/app/providers.tsx app/app/layout.tsx
git commit -m "feat(data): set up React Query provider"
```

---

### Task 3: Create React Query hooks for learning paths

**Files:**
- Create: `app/lib/hooks/use-learning-paths.ts`

**Step 1: Create hooks file**

```typescript
// app/lib/hooks/use-learning-paths.ts
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
        .select('*')
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
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
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
```

**Step 2: Verify build**

Run: `cd app && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add app/lib/hooks/use-learning-paths.ts
git commit -m "feat(data): add React Query hooks for learning paths"
```

---

### Task 4: Install shadcn sidebar + tooltip + separator

**Files:**
- Install shadcn components: `sidebar`, `tooltip`, `separator`, `sheet`

**Step 1: Install components**

```bash
cd app
npx shadcn@latest add sidebar tooltip separator sheet -y
```

This creates files in `app/components/ui/`.

**Step 2: Verify build**

Run: `cd app && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add app/components/ui/ app/package.json app/package-lock.json
git commit -m "feat(ui): install shadcn sidebar, tooltip, separator, sheet"
```

---

### Task 5: Build the app sidebar

**Files:**
- Create: `app/app/components/AppSidebar.tsx`

**Step 1: Create sidebar component**

The sidebar shows:
- Logo + "Brainstorm" at top
- Navigation links: Dashboard, Paths, Graph, Chat
- User section at bottom with logout

```typescript
// app/app/components/AppSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Sparkles, LayoutDashboard, BookOpen, Network, MessageCircle, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/auth';

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Paths', href: '/paths', icon: BookOpen },
  { title: 'Graph', href: '/graph', icon: Network },
  { title: 'Chat', href: '/chat', icon: MessageCircle },
];

interface AppSidebarProps {
  userEmail?: string;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1">
          <Sparkles className="size-5 text-primary" />
          <span className="font-display font-bold text-lg">Brainstorm</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Explore</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + '/')}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-1">
          {userEmail && (
            <p className="text-xs text-muted-foreground truncate mb-2">{userEmail}</p>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
```

**Step 2: Verify build**

Run: `cd app && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add app/app/components/AppSidebar.tsx
git commit -m "feat(ui): create app sidebar with navigation"
```

---

### Task 6: Build the protected layout with sidebar

**Files:**
- Modify: `app/app/(protected)/layout.tsx`

**Step 1: Rewrite protected layout**

```typescript
// app/app/(protected)/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/components/AppSidebar';
import { Separator } from '@/components/ui/separator';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user?.email} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

**Step 2: Simplify dashboard page** (remove duplicate header/logout since sidebar handles it)

```typescript
// app/app/(protected)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Welcome back, explorer</h1>
        <p className="text-muted-foreground mt-1">Your learning journey continues.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border border-border rounded-lg bg-card">
          <h2 className="text-xl font-display font-semibold mb-4">Your Learning Paths</h2>
          <p className="text-sm text-muted-foreground">
            No paths yet. Start a conversation to co-design your first learning journey.
          </p>
        </div>

        <div className="p-6 border border-border rounded-lg bg-card">
          <h2 className="text-xl font-display font-semibold mb-4">Knowledge Graph</h2>
          <p className="text-sm text-muted-foreground">
            Your graph will appear here as you explore and connect ideas.
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Verify build**

Run: `cd app && npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add app/app/(protected)/layout.tsx app/app/(protected)/dashboard/page.tsx
git commit -m "feat(ui): add sidebar layout to protected pages"
```

---

### Task 7: Create placeholder pages for paths, graph, chat

**Files:**
- Create: `app/app/(protected)/paths/page.tsx`
- Create: `app/app/(protected)/graph/page.tsx`
- Create: `app/app/(protected)/chat/page.tsx`

**Step 1: Create paths page**

```typescript
// app/app/(protected)/paths/page.tsx
export default function PathsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Learning Paths</h1>
        <p className="text-muted-foreground mt-1">All your learning journeys in one place.</p>
      </div>

      <div className="p-12 border border-dashed border-border rounded-xl text-center">
        <p className="text-muted-foreground">
          No learning paths yet. Start a conversation with AI to co-design your first path.
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Create graph page**

```typescript
// app/app/(protected)/graph/page.tsx
export default function GraphPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Knowledge Graph</h1>
        <p className="text-muted-foreground mt-1">Watch your knowledge grow and connect.</p>
      </div>

      <div className="p-12 border border-dashed border-border rounded-xl text-center">
        <p className="text-muted-foreground">
          Your graph will come alive as you explore learning paths and discover connections.
        </p>
      </div>
    </div>
  );
}
```

**Step 3: Create chat page**

```typescript
// app/app/(protected)/chat/page.tsx
export default function ChatPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Chat</h1>
        <p className="text-muted-foreground mt-1">Your AI learning companion.</p>
      </div>

      <div className="p-12 border border-dashed border-border rounded-xl text-center">
        <p className="text-muted-foreground">
          Conversations with your Socratic guide will appear here.
        </p>
      </div>
    </div>
  );
}
```

**Step 4: Verify build**

Run: `cd app && npm run build`
Expected: PASS — should show new routes `/paths`, `/graph`, `/chat`

**Step 5: Commit**

```bash
git add "app/app/(protected)/paths/" "app/app/(protected)/graph/" "app/app/(protected)/chat/"
git commit -m "feat(ui): add placeholder pages for paths, graph, and chat"
```

---

## Verification

After all tasks:

1. `npm run build` — all routes compile
2. `npm run dev` — navigate:
   - `/` → landing page (unauthenticated)
   - Login → redirects to `/dashboard`
   - Sidebar visible with 4 nav links
   - Active link highlighted
   - Click Paths, Graph, Chat → placeholder pages render
   - Sign Out from sidebar → returns to `/`
3. Supabase Studio (`http://127.0.0.1:54323`) — tables visible, RLS policies active

---

## Files Summary

| Action | File |
|--------|------|
| Generated | `app/types/database.ts` (Supabase types) |
| Modified | `app/lib/supabase/client.ts` (add `Database` generic) |
| Modified | `app/lib/supabase/server.ts` (add `Database` generic) |
| Created | `app/app/providers.tsx` (React Query) |
| Modified | `app/app/layout.tsx` (wrap with Providers) |
| Created | `app/lib/hooks/use-learning-paths.ts` |
| Installed | shadcn `sidebar`, `tooltip`, `separator`, `sheet` |
| Created | `app/app/components/AppSidebar.tsx` |
| Modified | `app/app/(protected)/layout.tsx` (sidebar shell) |
| Modified | `app/app/(protected)/dashboard/page.tsx` (simplified) |
| Created | `app/app/(protected)/paths/page.tsx` |
| Created | `app/app/(protected)/graph/page.tsx` |
| Created | `app/app/(protected)/chat/page.tsx` |
