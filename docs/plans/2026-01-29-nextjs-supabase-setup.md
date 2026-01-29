# Next.js + Supabase Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Initialize Next.js 14 app with Supabase authentication, create database schema with RLS policies, and build foundational app structure.

**Architecture:** Next.js App Router with Server Components for data fetching, Client Components for interactivity, Supabase for backend (auth + database), middleware for route protection.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase, shadcn/ui, React Query

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `app/package.json` (entire Next.js structure in `/app` subdirectory)
- Create: `app/tsconfig.json`
- Create: `app/next.config.js`
- Create: `app/tailwind.config.ts`

**Step 1: Create Next.js app in /app subdirectory**

Run:
```bash
npx create-next-app@latest app --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

When prompted:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Customize default import alias: Yes (`@/*`)

Expected: Creates `/app` directory with Next.js 14 structure

**Step 2: Verify structure**

Run:
```bash
ls -la app/
```

Expected output:
```
app/
├── app/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

**Step 3: Move .env files to app directory**

Run:
```bash
mv .env.local app/.env.local
mv .env.local.example app/.env.local.example
```

**Step 4: Update .gitignore in root**

Add to root `.gitignore`:
```
# Next.js app
app/node_modules/
app/.next/
app/out/
```

**Step 5: Commit**

```bash
git add app/ .gitignore
git commit -m "feat(setup): initialize Next.js 14 app with TypeScript and Tailwind"
```

---

## Task 2: Install Core Dependencies

**Files:**
- Modify: `app/package.json`

**Step 1: Install Supabase packages**

Run (from `/app` directory):
```bash
cd app
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

Expected: Packages added to `package.json` dependencies

**Step 2: Install AI SDK packages**

Run:
```bash
npm install ai @ai-sdk/anthropic zod
```

Expected: Vercel AI SDK and dependencies installed

**Step 3: Install React Query**

Run:
```bash
npm install @tanstack/react-query
```

**Step 4: Install shadcn/ui CLI**

Run:
```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Expected: Creates `components/ui/` directory and config

**Step 5: Verify package.json**

Run:
```bash
cat package.json | grep -A 20 '"dependencies"'
```

Expected to see:
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs
- ai
- @ai-sdk/anthropic
- @tanstack/react-query
- zod

**Step 6: Commit**

```bash
git add package.json package-lock.json components/ lib/
git commit -m "feat(deps): install Supabase, AI SDK, and React Query"
```

---

## Task 3: Configure Supabase Client

**Files:**
- Create: `app/lib/supabase/client.ts`
- Create: `app/lib/supabase/server.ts`
- Create: `app/lib/supabase/middleware.ts`
- Create: `app/types/database.ts`

**Step 1: Create browser client**

File: `app/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create server client**

File: `app/lib/supabase/server.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Called from Server Component, ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Called from Server Component, ignore
          }
        },
      },
    }
  )
}
```

**Step 3: Create middleware helper**

File: `app/lib/supabase/middleware.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

**Step 4: Create database types placeholder**

File: `app/types/database.ts`
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Will be auto-generated from Supabase
    }
  }
}
```

**Step 5: Commit**

```bash
git add lib/supabase/ types/
git commit -m "feat(supabase): configure client, server, and middleware helpers"
```

---

## Task 4: Set Up Next.js Middleware for Auth

**Files:**
- Create: `app/middleware.ts`

**Step 1: Create middleware**

File: `app/middleware.ts`
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 2: Test middleware syntax**

Run:
```bash
npx tsc --noEmit
```

Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): add middleware for Supabase session management"
```

---

## Task 5: Initialize Supabase Project

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/20260129000000_initial_schema.sql`

**Step 1: Initialize Supabase locally**

Run (from project root):
```bash
npx supabase init
```

Expected: Creates `/supabase` directory with config

**Step 2: Link to remote project**

Run:
```bash
npx supabase link --project-ref vqbhtgjksathzvixrtqq
```

When prompted for password: Use the database password from Supabase dashboard

Expected: Linked to remote Supabase project

**Step 3: Create initial migration file**

File: `supabase/migrations/20260129000000_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Learning Paths
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'resting')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('not_started', 'exploring', 'deepening', 'resting')) DEFAULT 'not_started',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module Dependencies (DAG)
CREATE TABLE module_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  prerequisite_module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_reference CHECK (module_id != prerequisite_module_id)
);

-- Learning Objectives
CREATE TABLE learning_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  depth_level TEXT CHECK (depth_level IN ('survey', 'intermediate', 'deep')) DEFAULT 'survey',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id UUID REFERENCES learning_objectives(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('video', 'article', 'book', 'course', 'paper')) NOT NULL,
  why_relevant TEXT NOT NULL,
  specific_context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Concepts (system-owned)
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by TEXT CHECK (created_by IN ('system', 'ai')) DEFAULT 'ai',
  verified BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Concept-Objective linking
CREATE TABLE concept_objectives (
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE NOT NULL,
  objective_id UUID REFERENCES learning_objectives(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (concept_id, objective_id)
);

-- User concept notes
CREATE TABLE user_concept_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE NOT NULL,
  personal_notes TEXT,
  validated BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge graph edges
CREATE TABLE graph_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  source_id UUID NOT NULL,
  source_type TEXT CHECK (source_type IN ('objective', 'concept')) NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT CHECK (target_type IN ('objective', 'concept')) NOT NULL,
  relationship TEXT CHECK (relationship IN ('prerequisite', 'enables', 'relates')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI messages (conversation history)
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  objective_id UUID REFERENCES learning_objectives(id) ON DELETE SET NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_name TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_modules_path_id ON modules(path_id);
CREATE INDEX idx_objectives_module_id ON learning_objectives(module_id);
CREATE INDEX idx_resources_objective_id ON resources(objective_id);
CREATE INDEX idx_messages_user_id ON ai_messages(user_id);
CREATE INDEX idx_messages_created_at ON ai_messages(created_at);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_graph_edges_user_id ON graph_edges(user_id);

-- RLS Policies

-- Learning Paths
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own paths"
  ON learning_paths FOR ALL
  USING (auth.uid() = user_id);

-- Modules (inherit from paths)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own modules"
  ON modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE learning_paths.id = modules.path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

-- Learning Objectives (inherit from modules)
ALTER TABLE learning_objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own objectives"
  ON learning_objectives FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN learning_paths ON modules.path_id = learning_paths.id
      WHERE learning_objectives.module_id = modules.id
      AND learning_paths.user_id = auth.uid()
    )
  );

-- Resources (inherit from objectives)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own resources"
  ON resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM learning_objectives
      JOIN modules ON learning_objectives.module_id = modules.id
      JOIN learning_paths ON modules.path_id = learning_paths.id
      WHERE resources.objective_id = learning_objectives.id
      AND learning_paths.user_id = auth.uid()
    )
  );

-- Concepts (read-only for users)
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read concepts"
  ON concepts FOR SELECT
  USING (TRUE);

-- User concept notes
ALTER TABLE user_concept_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own concept notes"
  ON user_concept_notes FOR ALL
  USING (auth.uid() = user_id);

-- Graph edges
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own graph edges"
  ON graph_edges FOR ALL
  USING (auth.uid() = user_id);

-- AI messages
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own messages"
  ON ai_messages FOR ALL
  USING (auth.uid() = user_id);

-- Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own events"
  ON events FOR ALL
  USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_objectives_updated_at
  BEFORE UPDATE ON learning_objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Step 4: Run migration locally**

Run:
```bash
npx supabase db reset
```

Expected: Migration applied successfully

**Step 5: Push migration to remote**

Run:
```bash
npx supabase db push
```

Expected: Schema deployed to production Supabase

**Step 6: Generate TypeScript types**

Run:
```bash
npx supabase gen types typescript --local > app/types/database.ts
```

Expected: `app/types/database.ts` populated with generated types

**Step 7: Commit**

```bash
git add supabase/ app/types/database.ts
git commit -m "feat(database): create initial schema with RLS policies"
```

---

## Task 6: Create App Structure

**Files:**
- Create: `app/app/layout.tsx`
- Create: `app/app/globals.css`
- Create: `app/app/(public)/welcome/page.tsx`
- Create: `app/app/(public)/auth/page.tsx`
- Create: `app/app/(protected)/layout.tsx`
- Create: `app/app/(protected)/dashboard/page.tsx`

**Step 1: Update root layout**

File: `app/app/layout.tsx`
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Brainstorm - The Infinite University',
  description: 'Learning that never ends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**Step 2: Create welcome page**

File: `app/app/(public)/welcome/page.tsx`
```typescript
import Link from 'next/link'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Brainstorm
          </h1>
          <p className="text-2xl text-gray-600 mb-2">
            The Infinite University
          </p>
          <p className="text-xl text-gray-500 mb-8">
            Learning that never ends
          </p>

          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-lg text-gray-700">
              Don't know what you don't know? That's the point. Brainstorm helps you discover what to learn through Socratic dialogue, not fixed syllabi.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/auth"
              className="px-8 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
            >
              Start Your Journey
            </Link>
            <Link
              href="/auth"
              className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Create auth page placeholder**

File: `app/app/(public)/auth/page.tsx`
```typescript
export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Sign in to Brainstorm
        </h2>
        <p className="text-center text-gray-600">
          Authentication UI coming soon...
        </p>
      </div>
    </div>
  )
}
```

**Step 4: Create protected layout with auth check**

File: `app/app/(protected)/layout.tsx`
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return <>{children}</>
}
```

**Step 5: Create dashboard page**

File: `app/app/(protected)/dashboard/page.tsx`
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">
          Welcome back, {user?.email}
        </h1>
        <p className="text-gray-600">
          Your learning journey starts here.
        </p>
      </div>
    </div>
  )
}
```

**Step 6: Test routing**

Run:
```bash
cd app && npm run dev
```

Visit: http://localhost:3000/welcome

Expected: Welcome page loads without errors

Visit: http://localhost:3000/dashboard

Expected: Redirects to /auth (no user logged in)

**Step 7: Commit**

```bash
git add app/
git commit -m "feat(ui): create app structure with public and protected routes"
```

---

## Task 7: Verify Setup

**Step 1: Check all environment variables**

Run:
```bash
cd app && cat .env.local
```

Expected to see:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ANTHROPIC_API_KEY

**Step 2: Run TypeScript check**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Run dev server**

Run:
```bash
npm run dev
```

Expected: Server starts on http://localhost:3000

**Step 4: Test database connection**

Create temporary test file: `app/test-db.ts`
```typescript
import { createClient } from '@/lib/supabase/server'

async function testConnection() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('learning_paths').select('count')

  if (error) {
    console.error('DB Error:', error)
  } else {
    console.log('DB Connected! Count:', data)
  }
}

testConnection()
```

Run:
```bash
npx tsx test-db.ts
```

Expected: "DB Connected! Count: []"

Delete test file after verification.

**Step 5: Push to GitHub**

```bash
git push origin main
```

---

## Success Criteria

✅ Next.js app running in `/app` directory
✅ TypeScript configured with no errors
✅ Supabase clients (browser, server, middleware) configured
✅ Database schema deployed with RLS policies
✅ Protected routes redirect unauthenticated users
✅ Welcome page accessible at `/welcome`
✅ Dashboard page accessible (after auth) at `/dashboard`
✅ All changes committed and pushed to GitHub

---

## Next Steps

After completing this plan:
1. Implement authentication UI (signup/login forms)
2. Build AI chat interface with streaming
3. Create learning paths CRUD pages
4. Implement knowledge graph visualization

---

**Total Estimated Time:** 2-3 hours
