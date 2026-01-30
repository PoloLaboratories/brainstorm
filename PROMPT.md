# Brainstorm — Product Completion Prompt

> **Purpose:** A self-resuming, phase-gated implementation prompt for completing all missing features in Brainstorm — The Infinite University.

---

## Context Files (Read These First)

```
@docs/specs.md           # Full product specification
@docs/contributing.md    # Philosophy, entity relationships, state semantics
@docs/design_system.md   # Colors (OKLch), typography, animations, components
@CLAUDE.md               # Commit rules, MCP servers, coding standards
```

### Existing Codebase Patterns

**Hooks** (`app/lib/hooks/`): All use React Query + Supabase. Pattern:
- Query: `useQuery({ queryKey: ['entity'], queryFn: async () => { ... } })`
- Mutation: `useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries(...) })`
- Auth: `const { data: { user } } = await supabase.auth.getUser()` inside mutationFn
- Types: Import from `@/types/database` — `Database['public']['Tables']['table_name']['Row' | 'Insert' | 'Update']`

**Components**: Cards (Link wrapper + hover effects + accent gradient), Dialogs (shadcn `Dialog` + controlled state + form), Lists (accordion/collapsible + inline editing + concept tags), InlineEdit (edit-on-click pattern).

**Migrations**: Files in `supabase/migrations/` with format `YYYYMMDDHHMMSS_description.sql`. All tables use `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`, `user_id UUID REFERENCES auth.users(id)`, `created_at/updated_at TIMESTAMPTZ DEFAULT now()`, RLS policies scoped to `auth.uid()`.

**Pages**: Next.js App Router at `app/app/(protected)/`. Server layout passes user; pages are client components using hooks.

**Graph**: Canvas-based D3-force in `ForceGraph.tsx`. Data from `useGraphData()` hook that derives transitive edges from junction tables. Node types in `NODE_TYPE_META`.

---

## Resumption Checklist

**Run this FIRST on every iteration to determine your current phase.**

```bash
echo "=== RESUMPTION CHECKLIST ==="

# Phase 1: Projects
echo "--- Phase 1: Projects ---"
ls supabase/migrations/*projects* 2>/dev/null && echo "MIGRATION: EXISTS" || echo "MIGRATION: MISSING"
ls app/lib/hooks/use-projects.ts 2>/dev/null && echo "HOOK: EXISTS" || echo "HOOK: MISSING"
ls app/app/\(protected\)/projects/\[id\]/page.tsx 2>/dev/null && echo "DETAIL PAGE: EXISTS" || echo "DETAIL PAGE: MISSING"
ls app/app/components/projects/ 2>/dev/null && echo "COMPONENTS: EXISTS" || echo "COMPONENTS: MISSING"

# Phase 2: Evaluations
echo "--- Phase 2: Evaluations ---"
ls supabase/migrations/*evaluations* 2>/dev/null && echo "MIGRATION: EXISTS" || echo "MIGRATION: MISSING"
ls app/lib/hooks/use-evaluations.ts 2>/dev/null && echo "HOOK: EXISTS" || echo "HOOK: MISSING"
ls app/app/\(protected\)/evaluations/\[id\]/page.tsx 2>/dev/null && echo "DETAIL PAGE: EXISTS" || echo "DETAIL PAGE: MISSING"
ls app/app/components/evaluations/ 2>/dev/null && echo "COMPONENTS: EXISTS" || echo "COMPONENTS: MISSING"

# Phase 3: AI Edge Functions
echo "--- Phase 3: AI Edge Functions ---"
ls supabase/functions/ai-chat/index.ts 2>/dev/null && echo "AI-CHAT: EXISTS" || echo "AI-CHAT: MISSING"
ls supabase/functions/curriculum-design/index.ts 2>/dev/null && echo "CURRICULUM: EXISTS" || echo "CURRICULUM: MISSING"
ls supabase/functions/resource-collection/index.ts 2>/dev/null && echo "RESOURCES: EXISTS" || echo "RESOURCES: MISSING"
ls supabase/functions/generate-sparks/index.ts 2>/dev/null && echo "SPARKS: EXISTS" || echo "SPARKS: MISSING"
ls supabase/functions/generate-questions/index.ts 2>/dev/null && echo "QUESTIONS: EXISTS" || echo "QUESTIONS: MISSING"
ls supabase/functions/generate-evaluation/index.ts 2>/dev/null && echo "EVAL-GEN: EXISTS" || echo "EVAL-GEN: MISSING"
ls supabase/functions/grade-evaluation/index.ts 2>/dev/null && echo "EVAL-GRADE: EXISTS" || echo "EVAL-GRADE: MISSING"

# Phase 4: AI Chat UI
echo "--- Phase 4: AI Chat UI ---"
ls app/app/components/chat/ 2>/dev/null && echo "CHAT COMPONENTS: EXISTS" || echo "CHAT COMPONENTS: MISSING"

# Phase 5: Dashboard + Graph + Dependencies + Open Questions + Sparks
echo "--- Phase 5: Dashboard + Graph ---"
grep -l "useDashboardStats\|use-dashboard" app/app/\(protected\)/dashboard/page.tsx 2>/dev/null && echo "DASHBOARD WIRED: YES" || echo "DASHBOARD WIRED: NO"
ls app/lib/hooks/use-graph-edges.ts 2>/dev/null && echo "GRAPH EDGES HOOK: EXISTS" || echo "GRAPH EDGES HOOK: MISSING"
ls app/lib/hooks/use-module-dependencies.ts 2>/dev/null && echo "MODULE DEPS HOOK: EXISTS" || echo "MODULE DEPS HOOK: MISSING"
ls supabase/migrations/*open_questions* 2>/dev/null && echo "OPEN QUESTIONS MIGRATION: EXISTS" || echo "OPEN QUESTIONS MIGRATION: MISSING"
ls app/lib/hooks/use-curiosity-sparks.ts 2>/dev/null && echo "SPARKS HOOK: EXISTS" || echo "SPARKS HOOK: MISSING"

# Phase 6: Vector Embeddings
echo "--- Phase 6: Vectors ---"
ls supabase/migrations/*vectors* 2>/dev/null && echo "VECTOR MIGRATION: EXISTS" || echo "VECTOR MIGRATION: MISSING"
ls supabase/functions/embed/index.ts 2>/dev/null && echo "EMBED FUNCTION: EXISTS" || echo "EMBED FUNCTION: MISSING"

# Phase 7: Settings + Final Integration
echo "--- Phase 7: Settings + Polish ---"
grep -l "useSettings\|SettingsForm\|ThemeToggle" app/app/\(protected\)/settings/page.tsx 2>/dev/null && echo "SETTINGS: WIRED" || echo "SETTINGS: PLACEHOLDER"

# Phase 8: Ideas (OPTIONAL — implement only if confirmed)
echo "--- Phase 8: Ideas (OPTIONAL) ---"
ls supabase/migrations/*ideas* 2>/dev/null && echo "MIGRATION: EXISTS" || echo "MIGRATION: MISSING"
ls app/lib/hooks/use-ideas.ts 2>/dev/null && echo "HOOK: EXISTS" || echo "HOOK: MISSING"
ls app/app/\(protected\)/ideas/\[id\]/page.tsx 2>/dev/null && echo "DETAIL PAGE: EXISTS" || echo "DETAIL PAGE: MISSING"
ls app/app/components/ideas/ 2>/dev/null && echo "COMPONENTS: EXISTS" || echo "COMPONENTS: MISSING"

# Build + Test
echo "--- Build + Test ---"
cd app && npx next build 2>&1 | tail -5
```

**Decision logic:**
- If Phase N has any MISSING items → start at Phase N
- If all items for a phase exist but tests fail → fix within that phase
- Phase 8 (Ideas) is OPTIONAL — **ask the user before implementing.** If user says skip, output completion after Phase 7.
- If all gates pass through Phase 7 (or Phase 8 if confirmed) → output `<promise>PRODUCT COMPLETE</promise>`

---

## Phase 1: Projects + Subtables

### 1.1 Migration: `projects`, `project_links`, `project_notes`, `project_todos`, `project_concepts`, `project_objectives`

File: `supabase/migrations/20260131000000_projects.sql`

**Tables:**

```sql
-- projects
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'self' CHECK (source IN ('ai', 'community', 'self')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- project_links (external references)
CREATE TABLE public.project_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- project_notes
CREATE TABLE public.project_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- project_todos
CREATE TABLE public.project_todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- project_concepts junction
CREATE TABLE public.project_concepts (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, concept_id)
);

-- project_objectives junction
CREATE TABLE public.project_objectives (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES public.learning_objectives(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, objective_id)
);
```

Add: updated_at triggers, RLS policies (user-owned on projects, inherited via EXISTS subquery on subtables), indexes on all FKs.

### 1.2 Hooks

- `app/lib/hooks/use-projects.ts` — `useProjects()`, `useProject(id)`, `useCreateProject()`, `useUpdateProject()`, `useDeleteProject()`
- `app/lib/hooks/use-project-links.ts` — CRUD scoped to project_id
- `app/lib/hooks/use-project-notes.ts` — CRUD scoped to project_id
- `app/lib/hooks/use-project-todos.ts` — CRUD + toggle completion + reorder
- Extend `use-concepts.ts` ENTITY_CONFIG: `project: { table: 'project_concepts', fk: 'project_id' }`

### 1.3 Components (`app/app/components/projects/`)

- `ProjectCard.tsx` — Card with source badge, status, todo progress bar, linked concept count
- `CreateProjectDialog.tsx` — Title, description, source selector
- `ProjectHeader.tsx` — Title (inline edit), description, status selector, source badge
- `ProjectLinks.tsx` — List + add/delete external links
- `ProjectNotes.tsx` — List of notes with inline editing + create
- `ProjectTodos.tsx` — Checklist with add/toggle/delete/reorder
- `ProjectObjectives.tsx` — Link/unlink objectives to project

### 1.4 Pages

- Update `app/app/(protected)/projects/page.tsx` — List view with ProjectCards, CreateProjectDialog trigger, filter by status/source
- Create `app/app/(protected)/projects/[id]/page.tsx` — Detail: ProjectHeader, tabbed sections (Todos, Notes, Links, Objectives, Concepts)

### 1.5 Tests

- Hook tests for all CRUD hooks (mock Supabase client)
- Component tests for ProjectCard, CreateProjectDialog, ProjectTodos (toggle, reorder)
- Use React Testing Library + Vitest

### 1.6 Persona Validation

Dispatch all 4 persona testers in parallel:
- `builder-persona-tester` — Sam tests full project workflow (create project, add todos, link objectives, add notes/links)
- `investor-persona-tester` — Jordan tests creating an investment memo project
- `researcher-persona-tester` — Elena tests creating a literature review project
- `lifelong-learner-tester` — Tests creating a project linked to learning

### 1.7 Gate Check

```bash
supabase db reset                          # Migration applies
cd app && npx tsc --noEmit                 # Types compile
cd app && npx next build                   # Build succeeds
cd app && npx vitest run --reporter=verbose # Tests pass
```

### 1.8 Commits

```
feat(projects): add projects schema with links, notes, todos, and junctions
feat(projects): add project hooks (CRUD, links, notes, todos)
feat(projects): add project components
feat(projects): add projects list and detail pages
test(projects): add hook and component tests
```

---

## Phase 2: Evaluations

### 2.1 Migration

File: `supabase/migrations/20260131100000_evaluations.sql`

**Tables:**

```sql
-- evaluations
CREATE TABLE public.evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  objective_id UUID REFERENCES public.learning_objectives(id) ON DELETE SET NULL,
  concept_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('survey', 'intermediate', 'deep')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (objective_id IS NOT NULL OR concept_id IS NOT NULL)
);

-- evaluation_questions
CREATE TABLE public.evaluation_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'open' CHECK (question_type IN ('open', 'multiple_choice', 'true_false')),
  options JSONB, -- for multiple_choice: ["option1", "option2", ...]
  correct_answer TEXT,
  explanation TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- evaluation_attempts
CREATE TABLE public.evaluation_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  score NUMERIC,
  feedback TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- evaluation_answers
CREATE TABLE public.evaluation_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.evaluation_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.evaluation_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Add: RLS policies, updated_at trigger on evaluations, indexes.

### 2.2 Hooks

- `app/lib/hooks/use-evaluations.ts` — `useEvaluations()`, `useEvaluation(id)`, `useCreateEvaluation()`, `useDeleteEvaluation()`
- `app/lib/hooks/use-evaluation-questions.ts` — CRUD scoped to evaluation_id
- `app/lib/hooks/use-evaluation-attempts.ts` — `useCreateAttempt()`, `useSubmitAttempt()`, `useAttempts(evaluationId)`

### 2.3 Components (`app/app/components/evaluations/`)

- `EvaluationCard.tsx` — Card showing title, linked objective/concept, difficulty badge, attempt count
- `CreateEvaluationDialog.tsx` — Title, description, link to objective or concept, difficulty
- `QuestionManager.tsx` — Add/edit/delete/reorder questions (admin view)
- `TakeEvaluation.tsx` — Step-through question UI, submit answers
- `AttemptResults.tsx` — Show score, per-question feedback, overall feedback

### 2.4 Pages

- Update `app/app/(protected)/evaluations/page.tsx` — List + create
- Create `app/app/(protected)/evaluations/[id]/page.tsx` — Detail with tabs: Questions (manage), Take Evaluation, Past Attempts

### 2.5 Tests

- Hook tests for evaluation CRUD + attempt submission
- Component tests for TakeEvaluation flow, QuestionManager

### 2.6 Persona Validation

- `researcher-persona-tester` — Elena tests self-assessment on computational neuroscience concept
- `lifelong-learner-tester` — Tests evaluation flow for survey-level objective
- `builder-persona-tester` — Sam tests evaluation linked to a project objective
- `investor-persona-tester` — Jordan tests rapid evaluation of domain knowledge

### 2.7 Gate Check

```bash
supabase db reset && cd app && npx tsc --noEmit && npx next build && npx vitest run
```

### 2.8 Commits

```
feat(evaluations): add evaluations schema with questions, attempts, answers
feat(evaluations): add evaluation hooks
feat(evaluations): add evaluation components and take-evaluation flow
feat(evaluations): add evaluations list and detail pages
test(evaluations): add hook and component tests
```

---

## Phase 3: AI Edge Functions (Local Supabase)

### 3.1 Shared Utilities

Create `supabase/functions/_shared/` with:
- `cors.ts` — Standard CORS headers for edge functions
- `supabase-client.ts` — Create admin Supabase client from `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env vars
- `llm-client.ts` — Wrapper for LLM API calls (OpenAI/Anthropic). Read `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` from env. Support model routing (cheap model for intent detection + simple Q&A, expensive model for co-design + resource curation).
- `context-builder.ts` — Build RAG context from user's knowledge graph: fetch paths, modules, objectives, concepts, projects, recent conversations. Return formatted context string for LLM prompts.

### 3.2 Router: `ai-chat`

File: `supabase/functions/ai-chat/index.ts`

**Responsibilities:**
- Receives user message + context (path_id, module_id, objective_id)
- Detects intent: curriculum design, resource collection, general Q&A, discussion
- Routes to specialized functions or handles directly
- Stores user + AI messages in `ai_messages` table
- Returns streaming or complete response

**Intent Detection:**
- Use a lightweight LLM call (e.g., GPT-3.5/Haiku) to classify intent
- Pass intent + message to appropriate handler

### 3.3 Curriculum Co-Design: `curriculum-design`

File: `supabase/functions/curriculum-design/index.ts`

**Capabilities:**
- Receives learning goal + user context
- Uses web search / Exa to research existing curricula (Coursera, MIT OCW, etc.)
- Asks Socratic clarifying questions (background, depth, constraints)
- Proposes learning path structure (modules + objectives)
- Creates entities in DB when user approves
- Returns conversational response

### 3.4 Resource Collection: `resource-collection`

File: `supabase/functions/resource-collection/index.ts`

**Capabilities:**
- Receives objective + depth level + user context
- Searches for resources (YouTube, papers, books, tutorials)
- Evaluates quality and relevance
- Returns curated list with rationale and specific context (timestamps, chapters)
- Creates resource entries when user selects

### 3.5 Utility Functions (Non-Conversational, Background)

**`generate-sparks`** — `supabase/functions/generate-sparks/index.ts`
- Analyzes user's knowledge graph (concepts across paths)
- Generates 3 spark types: connection, expansion, tangent
- Stores in `curiosity_sparks` table (Phase 5 migration)
- Called as background job, NOT user-facing directly

**`generate-questions`** — `supabase/functions/generate-questions/index.ts`
- Analyzes module objectives and concepts
- Generates thought-provoking open questions
- Stores in `open_questions` table (Phase 5 migration)
- Called as background job when modules are created/updated

**`generate-evaluation`** — `supabase/functions/generate-evaluation/index.ts`
- Generates evaluation questions for an objective or concept
- Adjusts difficulty by depth level
- Returns question data for storage

**`grade-evaluation`** — `supabase/functions/grade-evaluation/index.ts`
- Receives attempt answers
- Grades each answer with feedback
- Returns scores and overall assessment

### 3.6 Environment Setup

Add to `supabase/config.toml` under `[edge_runtime.secrets]`:
```toml
[edge_runtime.secrets]
OPENAI_API_KEY = "env(OPENAI_API_KEY)"
```

Ensure `.env` or `.env.local` has `OPENAI_API_KEY` set for local development.

### 3.7 Staff Engineer Review

Before proceeding past this phase, dispatch `staff-engineer-review` subagent to evaluate:
- LLM model routing strategy (cost vs quality)
- Context window management approach
- Edge function timeout handling
- Caching strategy for repeated queries
- Error handling for LLM API failures

**The staff-engineer-review subagent must approve the architecture before proceeding.**

### 3.8 Testing

- Test each edge function locally: `supabase functions serve ai-chat --env-file .env.local`
- Invoke with curl to verify routing, response format, DB writes
- Test error cases: missing API key, timeout, malformed input

### 3.9 Gate Check

```bash
# Verify all functions exist and are servable
supabase functions list
supabase functions serve ai-chat --env-file .env.local &
sleep 3
curl -X POST http://localhost:54321/functions/v1/ai-chat \
  -H "Authorization: Bearer $(supabase auth token)" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","context":{}}' \
  && echo "AI-CHAT: OK"
kill %1

cd app && npx tsc --noEmit && npx next build
```

### 3.10 Commits

```
feat(ai): add shared utilities for edge functions (cors, llm-client, context-builder)
feat(ai): add ai-chat router edge function with intent detection
feat(ai): add curriculum-design edge function
feat(ai): add resource-collection edge function
feat(ai): add generate-sparks utility edge function
feat(ai): add generate-questions utility edge function
feat(ai): add generate-evaluation and grade-evaluation edge functions
test(ai): add edge function integration tests
```

---

## Phase 4: AI Chat UI

### 4.1 Components (`app/app/components/chat/`)

- `AIChatPanel.tsx` — Persistent side panel. Shows conversation thread. Context-aware header (shows current path/module if applicable). Collapsible/expandable. Positioned in protected layout.
- `ChatMessage.tsx` — Renders user vs AI messages. AI messages support markdown rendering. User messages show timestamp. Typing indicator for AI responses.
- `ChatInput.tsx` — Text input + send button. Supports Enter to send, Shift+Enter for newline. Disabled during AI response. Shows context pills.
- `ChatContextPills.tsx` — Shows current context (path, module, objective). Clickable to navigate to that entity.

### 4.2 Hook

- `app/lib/hooks/use-ai-messages.ts` — `useAiMessages(contextFilter?)`, `useCreateAiMessage()`. Context filter accepts optional path_id, module_id, objective_id to scope conversations.

### 4.3 Integration

- Add `AIChatPanel` to `app/app/(protected)/layout.tsx` — persistent across all protected pages
- Wire to `use-ai-messages.ts` hook for message persistence
- On submit: call `ai-chat` edge function, stream response, store user + AI messages
- Context detection: use current URL/route to infer context (path_id from `/paths/[id]`, etc.)

### 4.4 Tests

- Component tests for ChatMessage rendering (user vs AI, markdown)
- Component tests for ChatInput (submit, disabled state, Enter key)
- Integration test for panel open/close behavior

### 4.5 Persona Validation

All 4 persona testers test AI conversation from their perspective:
- `researcher-persona-tester` — Elena asks about spiking neural networks
- `builder-persona-tester` — Sam asks for help learning WebSockets for his project
- `investor-persona-tester` — Jordan asks to design a learning path for carbon markets
- `lifelong-learner-tester` — General curiosity-driven conversation

### 4.6 Gate Check

```bash
cd app && npx tsc --noEmit && npx next build && npx vitest run
# Manual: open app, verify chat panel appears, send message, verify response
```

### 4.7 Commits

```
feat(chat): add AIChatPanel, ChatMessage, ChatInput components
feat(chat): add use-ai-messages hook
feat(chat): integrate chat panel into protected layout
test(chat): add chat component tests
```

---

## Phase 5: Dashboard + Graph + Dependencies + Open Questions + Curiosity Sparks

### 5.1 Migration: `open_questions`, `curiosity_sparks`

File: `supabase/migrations/20260131200000_open_questions_and_sparks.sql`

```sql
-- open_questions (system-generated + user-created)
CREATE TABLE public.open_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  context TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'exploring', 'resolved')),
  generated BOOLEAN NOT NULL DEFAULT FALSE, -- true if system-generated
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- curiosity_sparks (system-generated in background)
CREATE TABLE public.curiosity_sparks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  spark_type TEXT NOT NULL CHECK (spark_type IN ('connection', 'expansion', 'tangent')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  context JSONB, -- linked entity IDs, rationale
  dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Add: RLS policies (user-owned), updated_at trigger on open_questions, indexes.

**Open questions and curiosity sparks are system-generated in the background** by the `generate-questions` and `generate-sparks` edge functions (Phase 3). Users can also manually create open questions.

### 5.2 Hooks

- `app/lib/hooks/use-open-questions.ts` — `useOpenQuestions(moduleId?)`, `useCreateOpenQuestion()`, `useUpdateOpenQuestion()`, `useDeleteOpenQuestion()`
- `app/lib/hooks/use-curiosity-sparks.ts` — `useCuriositySparks()`, `useDismissSpark()`
- `app/lib/hooks/use-dashboard-stats.ts` — Aggregation queries: count objectives (completed/total), count paths, count projects, engagement streak (days with activity from events table)
- `app/lib/hooks/use-graph-edges.ts` — `useGraphEdges()`, `useCreateGraphEdge()`, `useDeleteGraphEdge()`
- `app/lib/hooks/use-module-dependencies.ts` — `useModuleDependencies(pathId)`, `useCreateDependency()`, `useDeleteDependency()`

### 5.3 Open Questions Component

- `OpenQuestionList.tsx` — Integrate into `ModuleAccordion`. Shows open questions for module. Status badge (open/exploring/resolved). Inline create for user-authored questions. Inline status toggle. System-generated questions show a subtle "AI suggested" indicator.

### 5.4 Dashboard Wiring

Update `app/app/(protected)/dashboard/page.tsx`:
- Replace hardcoded `stats` array with `useDashboardStats()` hook — real counts from DB
- **Active Explorations** section: show real learning paths with status `active`/`exploring`/`deepening` using `useLearningPaths()`. If paths exist, show PathCards. If empty, keep the warm empty state.
- **Curiosity Sparks** section: show real sparks from `useCuriositySparks()`, with dismiss action. Keep the warm empty state when no sparks exist.
- **Active Projects** section: show real projects from `useProjects()` (limit 3)
- Knowledge graph: already uses `AnimatedKnowledgeGraph` — keep as-is or swap to live `ForceGraph` with user data

### 5.5 Graph Enhancements

- Extend `use-graph.ts` to include project nodes (fetch from projects table, add to nodes array with type `project`)
- Add `EdgeCreateDialog.tsx` — Select two nodes, choose relationship type (prerequisite, enables, relates, same_concept), create edge via `useCreateGraphEdge()`
- Display edge management UI on graph page (toolbar button or right-click context menu)

### 5.6 Module Dependencies UI

- `ModuleDependencies.tsx` — Within path detail page, show dependency arrows between modules. Add/remove dependencies via `useModuleDependencies()`. Visual DAG or simple dependency list.

### 5.7 Background Generation Triggers

Wire up background calls to `generate-sparks` and `generate-questions` edge functions:
- After a module is created or updated → call `generate-questions` (fire-and-forget)
- After an objective is completed → call `generate-sparks` (fire-and-forget)
- On dashboard load (if sparks are stale, e.g., none exist or all dismissed) → call `generate-sparks`

These calls are async, no UI blocking. Use `fetch()` to the edge function URL from the client.

### 5.8 Tests

- Update existing dashboard tests to verify real data rendering
- Test open questions CRUD + system-generated indicator
- Test curiosity sparks display + dismiss
- Test graph edge creation/deletion
- Test module dependencies add/remove

### 5.9 Persona Validation

All 4 persona testers validate dashboard + graph:
- Focus on whether dashboard feels alive with real data vs static
- Verify sparks are relevant and dismissible
- Test graph with project nodes
- Test open questions in module accordion

### 5.10 Gate Check

```bash
supabase db reset && cd app && npx tsc --noEmit && npx next build && npx vitest run
# Manual: verify dashboard shows real stats, sparks render, graph includes project nodes
```

### 5.11 Commits

```
feat(questions): add open_questions and curiosity_sparks schema
feat(questions): add use-open-questions and use-curiosity-sparks hooks
feat(questions): add OpenQuestionList component in ModuleAccordion
feat(dashboard): wire dashboard to real data with useDashboardStats
feat(dashboard): show real sparks and projects on dashboard
feat(graph): extend graph to include project nodes
feat(graph): add edge management UI (EdgeCreateDialog)
feat(modules): add module dependencies UI
feat(background): wire background generation triggers for sparks and questions
test(dashboard): update dashboard tests for real data
test(questions): add open questions and sparks tests
```

---

## Phase 6: Vector Embeddings for AI Context

### 6.1 Architecture Decision — Staff Engineer Review

**Before implementing**, dispatch `staff-engineer-review` subagent with this prompt:

> "We need to add vector embeddings to Brainstorm to improve AI conversation quality. The AI chat needs to retrieve relevant context from the user's knowledge graph (paths, modules, objectives, concepts, projects, resources) when answering questions. Evaluate: (1) What to embed — raw content vs summaries, (2) pgvector with HNSW vs external vector DB, (3) When to embed — real-time vs batch, (4) Embedding model choice, (5) Cost at 1K/10K/100K users. Our stack is Supabase Postgres + Edge Functions."

**The staff-engineer-review subagent must approve the approach before proceeding.**

### 6.2 Migration: Enable pgvector + embeddings table

File: `supabase/migrations/20260131300000_vectors.sql`

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table (polymorphic — stores embeddings for any entity)
CREATE TABLE public.embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('path', 'module', 'objective', 'concept', 'project', 'resource')),
  entity_id UUID NOT NULL,
  content_hash TEXT NOT NULL, -- detect when re-embedding is needed
  embedding vector(1536), -- dimension per staff-engineer recommendation
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for fast similarity search
CREATE INDEX ON public.embeddings USING hnsw (embedding vector_cosine_ops);

-- Unique constraint: one embedding per entity
CREATE UNIQUE INDEX ON public.embeddings (entity_type, entity_id);

-- RLS
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own embeddings" ON public.embeddings
  FOR ALL USING (auth.uid() = user_id);
```

**Note:** The `entity_type` CHECK constraint does NOT include `idea` — it will be added in Phase 8 if Ideas are implemented.

### 6.3 Embed Edge Function

File: `supabase/functions/embed/index.ts`

**Responsibilities:**
- Receives entity_type + entity_id (or batch of entities)
- Fetches entity content, builds summary string
- Calls embedding API (OpenAI `text-embedding-3-small` or per staff-engineer recommendation)
- Upserts into embeddings table with content_hash (skip if hash unchanged)
- Called as background job on entity create/update

### 6.4 Context Retrieval

Update `supabase/functions/_shared/context-builder.ts`:
- Add `findSimilarContext(userId, queryText, limit)` — embeds query, performs vector similarity search against user's embeddings, returns top-K entities with their content
- Integrate into `ai-chat` router: before calling LLM, retrieve similar context and inject into system prompt

### 6.5 Background Embedding Triggers

Wire embedding calls:
- On create/update of: paths, modules, objectives, concepts, projects, resources
- Call `embed` edge function from client-side hooks (fire-and-forget) or via Supabase database webhooks
- Batch processing: edge function accepts array of entities for bulk embedding

### 6.6 Staff Engineer Final Review

After implementation, dispatch `staff-engineer-review` again to verify:
- Embedding dimensions and model choice
- Index strategy (HNSW parameters)
- Cost projections at realistic user scales
- Error handling for embedding API failures
- Content hash prevents unnecessary re-embedding

**Must pass staff-engineer-review before proceeding.**

### 6.7 Gate Check

```bash
supabase db reset
# Verify pgvector extension enabled
supabase db query "SELECT * FROM pg_extension WHERE extname = 'vector'"
# Test embed function
supabase functions serve embed --env-file .env.local &
sleep 3
curl -X POST http://localhost:54321/functions/v1/embed \
  -H "Authorization: Bearer $(supabase auth token)" \
  -H "Content-Type: application/json" \
  -d '{"entity_type":"concept","entity_id":"test-id"}' \
  && echo "EMBED: OK"
kill %1

cd app && npx tsc --noEmit && npx next build && npx vitest run
```

### 6.8 Commits

```
feat(vectors): add pgvector extension and embeddings table
feat(vectors): add embed edge function for entity embedding
feat(vectors): add vector similarity search to context-builder
feat(vectors): wire background embedding triggers
test(vectors): add embedding integration tests
```

---

## Phase 7: Settings + Final Integration + Polish

### 7.1 Settings Page

Update `app/app/(protected)/settings/page.tsx`:
- Profile section: display email, name (if available from auth)
- Theme toggle: light/dark mode switch (persist to localStorage, toggle `.dark` class)
- Data stats: total paths, modules, objectives, concepts, projects (read-only dashboard)
- Account actions: logout button

### 7.2 Cross-Entity Concept Linking

Ensure concept linking works across ALL current entity types:
- Verify `use-concepts.ts` ENTITY_CONFIG includes: path, module, objective, project
- ConceptTagList + AddConceptPopover work on project detail page
- Graph reflects all concept connections

### 7.3 Cross-Entity Navigation

Add navigation links between related entities:
- On objective detail: show linked projects
- On concept detail: show linked projects (in addition to existing paths, modules, objectives)
- On project detail: show linked objectives, concepts

### 7.4 Sidebar Updates

Update `AppSidebar.tsx` to show counts/badges for:
- Active paths count
- Active projects count

### 7.5 Final Test Sweep

```bash
# Full test suite
cd app && npx vitest run --reporter=verbose

# Type check
cd app && npx tsc --noEmit

# Build
cd app && npx next build

# DB reset and verify all migrations
supabase db reset

# Edge functions exist
supabase functions list
```

### 7.6 Full Persona Validation

Dispatch ALL 4 persona testers + staff-engineer-review in parallel for final validation:

- `lifelong-learner-tester` — Full flow: create path → add modules → add objectives → view graph → use AI chat → take evaluation → check dashboard
- `researcher-persona-tester` — Deep path creation → open questions → concept connections → evaluation
- `builder-persona-tester` — Create project → link objectives → add todos/notes/links → use AI to find resources → view project in graph
- `investor-persona-tester` — Rapid path creation via AI → survey depth resources → cross-domain concept connections → evaluation self-assessment
- `staff-engineer-review` — Final architecture review: vector strategy, edge function design, cost projections, scaling considerations

**ALL persona testers must report no blockers (❌) before completion.**

### 7.7 Gate Check (Final — without Ideas)

```bash
echo "=== FINAL GATE CHECK ==="

# 1. All migrations apply cleanly
supabase db reset && echo "MIGRATIONS: PASS" || echo "MIGRATIONS: FAIL"

# 2. TypeScript compiles
cd app && npx tsc --noEmit && echo "TYPES: PASS" || echo "TYPES: FAIL"

# 3. Build succeeds
cd app && npx next build && echo "BUILD: PASS" || echo "BUILD: FAIL"

# 4. All tests pass
cd app && npx vitest run && echo "TESTS: PASS" || echo "TESTS: FAIL"

# 5. Edge functions exist
for fn in ai-chat curriculum-design resource-collection generate-sparks generate-questions generate-evaluation grade-evaluation embed; do
  ls supabase/functions/$fn/index.ts 2>/dev/null && echo "FUNCTION $fn: EXISTS" || echo "FUNCTION $fn: MISSING"
done

# 6. Key pages are no longer placeholders
for page in projects evaluations settings; do
  grep -l "coming soon\|No.*yet.*Start" app/app/\(protected\)/$page/page.tsx 2>/dev/null && echo "PAGE $page: STILL PLACEHOLDER" || echo "PAGE $page: IMPLEMENTED"
done

echo "=== ALL GATES MUST PASS ==="
```

### 7.8 Commits

```
feat(settings): add settings page with theme toggle and data stats
feat(concepts): extend concept linking to projects
feat(nav): add cross-entity navigation links
feat(sidebar): add entity counts to sidebar
test(integration): final test sweep across all features
```

### 7.9 Decision Point: Ideas

After Phase 7 gates pass, **ask the user:**

> "Phases 1-7 are complete. All features work without Ideas. Should I implement Phase 8 (Ideas + Conversations)? This adds: idea entity with status tracking, AI brainstorming conversations per idea, idea-to-path maturation, idea linking to objectives/concepts/projects."

- If user says **yes** → proceed to Phase 8
- If user says **skip** → output `<promise>PRODUCT COMPLETE</promise>`

---

## Phase 8: Ideas + Conversations (OPTIONAL)

> **This phase is optional.** Only implement if the user explicitly confirms after Phase 7.

### 8.1 Migration: `ideas`, `idea_objectives`, `idea_concepts`, `idea_projects`, alter `ai_messages`

File: `supabase/migrations/20260131400000_ideas.sql`

**Tables:**

```sql
-- ideas
CREATE TABLE public.ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'matured')),
  matured_path_id UUID REFERENCES public.learning_paths(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- idea_objectives junction
CREATE TABLE public.idea_objectives (
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES public.learning_objectives(id) ON DELETE CASCADE,
  PRIMARY KEY (idea_id, objective_id)
);

-- idea_concepts junction
CREATE TABLE public.idea_concepts (
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (idea_id, concept_id)
);

-- idea_projects junction
CREATE TABLE public.idea_projects (
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  PRIMARY KEY (idea_id, project_id)
);

-- Alter ai_messages to support idea context
ALTER TABLE public.ai_messages
  ADD COLUMN IF NOT EXISTS idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE;

-- Extend embeddings to support idea entity type
ALTER TABLE public.embeddings
  DROP CONSTRAINT IF EXISTS embeddings_entity_type_check;
ALTER TABLE public.embeddings
  ADD CONSTRAINT embeddings_entity_type_check
  CHECK (entity_type IN ('path', 'module', 'objective', 'concept', 'project', 'resource', 'idea'));

-- Update graph_edges to support idea node type (if constrained)
-- [Add any needed ALTER statements for graph_edges check constraints]
```

Add: updated_at trigger on ideas, RLS policies (user-owned), indexes on all FKs.

### 8.2 Hooks

- `app/lib/hooks/use-ideas.ts` — `useIdeas()`, `useIdea(id)`, `useCreateIdea()`, `useUpdateIdea()`, `useDeleteIdea()`
- Update `app/lib/hooks/use-ai-messages.ts` — Add `idea_id` to context filter
- Extend `use-concepts.ts` ENTITY_CONFIG to include `idea: { table: 'idea_concepts', fk: 'idea_id' }`

### 8.3 Components (`app/app/components/ideas/`)

- `IdeaCard.tsx` — Card with status badge, description, linked concept count, last message preview
- `IdeaStatusBadge.tsx` — active (amber), archived (muted), matured (sage)
- `CreateIdeaDialog.tsx` — Title, description, initial status
- `IdeaConversation.tsx` — Uses `AIChatPanel` component scoped to idea context via `idea_id`. Full AI brainstorming conversation.

### 8.4 Pages

- Update `app/app/(protected)/ideas/page.tsx` — List view with IdeaCards, CreateIdeaDialog trigger, filter by status
- Create `app/app/(protected)/ideas/[id]/page.tsx` — Detail view: header (title, status, edit), description, linked concepts (ConceptTagList), linked objectives, linked projects, IdeaConversation panel

### 8.5 Integration Updates

- Update dashboard: add "Recent Ideas" section using `useIdeas()` (limit 3)
- Update graph: extend `use-graph.ts` to include idea nodes (type `idea`)
- Update sidebar: add active ideas count
- Update cross-entity navigation: ideas ↔ objectives, ideas ↔ concepts, ideas ↔ projects
- Wire embedding triggers for ideas

### 8.6 Tests

- Hook tests for idea CRUD
- Component tests for IdeaCard, CreateIdeaDialog, IdeaStatusBadge
- Integration tests for idea conversation flow

### 8.7 Persona Validation

All 4 persona testers:
- `researcher-persona-tester` — Elena tests creating a hypothesis idea with AI brainstorming conversation
- `lifelong-learner-tester` — Tests capturing a curiosity as an idea, maturing it to a path
- `builder-persona-tester` — Sam tests linking an idea to a project
- `investor-persona-tester` — Jordan tests rapid idea capture for deal evaluation

### 8.8 Gate Check

```bash
echo "=== PHASE 8 GATE CHECK ==="
supabase db reset && echo "MIGRATIONS: PASS" || echo "MIGRATIONS: FAIL"
cd app && npx tsc --noEmit && echo "TYPES: PASS" || echo "TYPES: FAIL"
cd app && npx next build && echo "BUILD: PASS" || echo "BUILD: FAIL"
cd app && npx vitest run && echo "TESTS: PASS" || echo "TESTS: FAIL"

# Ideas-specific checks
ls app/lib/hooks/use-ideas.ts && echo "IDEAS HOOK: EXISTS" || echo "IDEAS HOOK: MISSING"
ls app/app/\(protected\)/ideas/\[id\]/page.tsx && echo "IDEAS DETAIL: EXISTS" || echo "IDEAS DETAIL: MISSING"
grep -l "IdeaCard\|useIdeas" app/app/\(protected\)/ideas/page.tsx && echo "IDEAS LIST: WIRED" || echo "IDEAS LIST: PLACEHOLDER"
```

### 8.9 Commits

```
feat(ideas): add ideas schema with junction tables
feat(ideas): add use-ideas hook and extend ai-messages for idea context
feat(ideas): add IdeaCard, CreateIdeaDialog, IdeaStatusBadge, IdeaConversation components
feat(ideas): add ideas list and detail pages
feat(ideas): integrate ideas into dashboard, graph, sidebar, and navigation
test(ideas): add hook and component tests
```

---

## Completion

When ALL Phase 7 gates pass (and Phase 8 if implemented) and ALL persona testers report no blockers:

<promise>PRODUCT COMPLETE</promise>

---

## How to Dispatch Subagents

The custom subagents (persona testers + staff engineer) are defined as `.claude/agents/*.md` files. They are **NOT** available as named Task tool agent types. To invoke them, use the `general-purpose` subagent type and include the agent's instructions in the prompt.

### Pattern for Dispatching a Persona Tester

```
Task tool call:
  subagent_type: "general-purpose"
  prompt: "You are acting as the [AGENT NAME] for Brainstorm.
    Read and adopt the full persona and testing protocol from:
    .claude/agents/[agent-file].md

    YOUR TASK: [specific testing scenario for this phase]

    Test by examining the code (components, hooks, pages) and evaluating against
    the persona's criteria. Report findings in the agent's specified output format."
```

### Agent File Mapping

| Agent Name | File | When to Use |
|------------|------|-------------|
| Staff Engineer Review | `.claude/agents/staff-engineer-review.md` | Phases 3, 6, and final review |
| Lifelong Learner Tester | `.claude/agents/lifelong-learner-tester.md` | Every phase — persona validation |
| Researcher Tester | `.claude/agents/researcher-persona-tester.md` | Every phase — persona validation |
| Builder Tester | `.claude/agents/builder-persona-tester.md` | Every phase — persona validation |
| Investor Tester | `.claude/agents/investor-persona-tester.md` | Every phase — persona validation |

### Dispatching All 4 Persona Testers in Parallel

Use a single message with 4 parallel `Task` tool calls, each with `subagent_type: "general-purpose"`, each loading a different `.claude/agents/*.md` file and testing the same phase deliverables.

### Staff Engineer Review Dispatch

```
Task tool call:
  subagent_type: "general-purpose"
  model: "opus"
  prompt: "You are acting as the Staff Engineer Review agent for Brainstorm.
    Read and adopt the full role from: .claude/agents/staff-engineer-review.md

    REVIEW REQUEST: [specific architecture question or implementation to review]

    Provide your assessment in the format specified in the agent file."
```

**Important:** Staff engineer reviews MUST use `model: "opus"` as specified in the agent file.

---

## Rules For Every Phase

1. **Use /test-driven-development** — Write tests before or alongside implementation. No phase is complete without tests.
2. **Use /verification-before-completion** — Run gate checks before claiming any phase is done.
3. **Commit discipline** — Format: `type(scope): description`. No Co-Authored-By lines. No Claude Code references.
4. **Design system compliance** — OKLch colors via tokens, warm tone, no punishment language, generous whitespace.
5. **Follow existing patterns** — Copy hook/component/page patterns from existing code exactly.
6. **Dispatch persona testers** — After each phase, run all 4 persona testers in parallel using `general-purpose` subagent type (see "How to Dispatch Subagents" above).
7. **Staff engineer gates** — Phases 3 and 6 require explicit staff-engineer-review approval via `general-purpose` subagent with `model: "opus"`.
8. **Local deployment** — Everything must work with `supabase start` + `cd app && npm run dev`. No external services except LLM API.
9. **Dispatch parallel agents** — When tasks within a phase are independent (e.g., migration + component scaffolding), dispatch them in parallel.
10. **Background generation** — Open questions and curiosity sparks are system-generated. Wire background calls to edge functions. Users see results, not triggers.
11. **Docker** — If Docker is needed for any reason, get `staff-engineer-review` approval first.
12. **Regenerate types** — After each migration, run `supabase gen types typescript --local > app/types/database.ts` to update TypeScript types.
