# Brainstorm MVP - Architecture Design

**Date:** 2026-01-29
**Status:** Approved
**Scope:** MVP (Curriculum Co-Design + Knowledge Graph)

---

## Overview

Brainstorm is a learning platform that co-designs curricula through Socratic dialogue and visualizes knowledge as a growing graph. This document defines the technical architecture for the MVP.

### MVP Features

**In Scope:**
- Authentication (Supabase Auth)
- AI-powered curriculum co-design (chat interface)
- Learning paths, modules, objectives, resources (CRUD)
- Knowledge graph visualization (objectives + concepts)
- User dashboard with stats

**Out of Scope (v2):**
- Ideas/conversations
- Curiosity sparks
- Open questions
- Projects
- Evaluations

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14 (App Router) | Server components, API routes, SEO for marketing pages |
| **Database** | Supabase (Postgres) | Managed backend, RLS, real-time capabilities |
| **Auth** | Supabase Auth | Integrated with database, magic links, social auth |
| **AI Orchestration** | Vercel AI SDK | Streaming responses, tool calling, Next.js integration |
| **AI Models** | Claude 3.5 Sonnet (conversation)<br>Perplexity Sonar Pro (research) | Quality Socratic dialogue + built-in web search |
| **State Management** | TanStack Query (React Query) | Server state caching, optimistic updates |
| **Graph Viz** | React Flow | Force-directed knowledge graph |
| **UI Components** | shadcn/ui + Tailwind | Matches design system, accessible |
| **Analytics** | PostHog + Custom Events | Product analytics + cost tracking |
| **Deployment** | Vercel | Zero-config, edge functions, preview deploys |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           Next.js App (App Router)              │
├─────────────────────────────────────────────────┤
│  Public:                                        │
│  • /welcome (marketing)                         │
│  • /auth (login/signup)                         │
│                                                  │
│  Protected (middleware auth check):             │
│  • /dashboard                                   │
│  • /paths & /paths/[id]                         │
│  • /graph                                       │
│  • /chat                                        │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌─────────────┐ ┌──────────┐ ┌──────────────┐
│  Supabase   │ │ AI Route │ │ Client State │
│  (Database  │ │ Handlers │ │ (React Query)│
│   + Auth)   │ │          │ │              │
└─────────────┘ └──────────┘ └──────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │   AI Agents      │
            ├──────────────────┤
            │ Router (Claude)  │
            │ Curriculum (Pplx)│
            │ Resources (Pplx) │
            └──────────────────┘
```

---

## Database Schema

### Core Tables

#### `learning_paths`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users NOT NULL
title           text NOT NULL
description     text
status          text CHECK (status IN ('active', 'resting')) DEFAULT 'active'
created_at      timestamp DEFAULT now()
updated_at      timestamp DEFAULT now()
```

#### `modules`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
path_id         uuid REFERENCES learning_paths ON DELETE CASCADE
title           text NOT NULL
description     text
status          text CHECK (status IN ('not_started', 'exploring', 'deepening', 'resting'))
                DEFAULT 'not_started'
created_at      timestamp DEFAULT now()
updated_at      timestamp DEFAULT now()
```

#### `module_dependencies` (DAG structure)
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
module_id               uuid REFERENCES modules ON DELETE CASCADE
prerequisite_module_id  uuid REFERENCES modules ON DELETE CASCADE
created_at              timestamp DEFAULT now()

-- Constraint: Prevent cycles (enforced by DAG validation trigger)
CONSTRAINT no_self_reference CHECK (module_id != prerequisite_module_id)
```

#### `learning_objectives`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
module_id       uuid REFERENCES modules ON DELETE CASCADE
title           text NOT NULL
description     text
depth_level     text CHECK (depth_level IN ('survey', 'intermediate', 'deep'))
                DEFAULT 'survey'
created_at      timestamp DEFAULT now()
updated_at      timestamp DEFAULT now()
```

#### `resources`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
objective_id        uuid REFERENCES learning_objectives ON DELETE CASCADE
title               text NOT NULL
url                 text NOT NULL
type                text CHECK (type IN ('video', 'article', 'book', 'course', 'paper'))
why_relevant        text NOT NULL
specific_context    jsonb -- { relevantTimestamps, relevantChapters, etc. }
created_at          timestamp DEFAULT now()
```

#### `concepts` (system-owned, AI-created)
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
name            text UNIQUE NOT NULL
description     text
created_by      text CHECK (created_by IN ('system', 'ai')) DEFAULT 'ai'
verified        boolean DEFAULT false
usage_count     int DEFAULT 0
created_at      timestamp DEFAULT now()
```

#### `concept_objectives` (many-to-many)
```sql
concept_id      uuid REFERENCES concepts ON DELETE CASCADE
objective_id    uuid REFERENCES learning_objectives ON DELETE CASCADE
created_at      timestamp DEFAULT now()

PRIMARY KEY (concept_id, objective_id)
```

#### `user_concept_notes` (personal annotations)
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users NOT NULL
concept_id      uuid REFERENCES concepts ON DELETE CASCADE
personal_notes  text
validated       boolean DEFAULT false
validated_at    timestamp
created_at      timestamp DEFAULT now()
```

#### `graph_edges` (knowledge graph relationships)
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users NOT NULL
source_id       uuid NOT NULL
source_type     text CHECK (source_type IN ('objective', 'concept'))
target_id       uuid NOT NULL
target_type     text CHECK (target_type IN ('objective', 'concept'))
relationship    text CHECK (relationship IN ('prerequisite', 'enables', 'relates'))
created_at      timestamp DEFAULT now()
```

#### `ai_messages` (conversation history)
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users NOT NULL
role            text CHECK (role IN ('user', 'assistant'))
content         text NOT NULL
-- Context (nullable, for scoped conversations)
path_id         uuid REFERENCES learning_paths ON DELETE SET NULL
module_id       uuid REFERENCES modules ON DELETE SET NULL
objective_id    uuid REFERENCES learning_objectives ON DELETE SET NULL
resource_id     uuid REFERENCES resources ON DELETE SET NULL
created_at      timestamp DEFAULT now()
```

#### `events` (custom analytics)
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users
event_name      text NOT NULL
properties      jsonb
created_at      timestamp DEFAULT now()
```

**Indexes:**
```sql
CREATE INDEX idx_modules_path_id ON modules(path_id);
CREATE INDEX idx_objectives_module_id ON learning_objectives(module_id);
CREATE INDEX idx_resources_objective_id ON resources(objective_id);
CREATE INDEX idx_messages_user_id ON ai_messages(user_id);
CREATE INDEX idx_messages_created_at ON ai_messages(created_at);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_created_at ON events(created_at);
```

### Row Level Security (RLS)

```sql
-- Users can only access their own data
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own paths"
  ON learning_paths FOR ALL
  USING (auth.uid() = user_id);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own messages"
  ON ai_messages FOR ALL
  USING (auth.uid() = user_id);

-- Concepts are read-only for users (AI creates them)
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read concepts"
  ON concepts FOR SELECT
  USING (true);

-- User concept notes are private
ALTER TABLE user_concept_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own concept notes"
  ON user_concept_notes FOR ALL
  USING (auth.uid() = user_id);

-- Modules, objectives, resources inherit path permissions
-- (enforced via foreign key cascade)
```

---

## AI Agent Architecture

### Agent Flow

```
User Message → Router Agent → Specialized Agent → Database Updates → Streamed Response
```

### 1. Router Agent (Claude 3.5 Sonnet)

**File:** `src/lib/ai/router.ts`

**Responsibilities:**
- Detect user intent from conversation
- Maintain conversation context (current path, module, objective)
- Route to specialized agents via tool calls
- Answer simple questions directly
- Stream responses to UI

**Available Tools:**
```typescript
{
  createCurriculumPath: tool({
    description: 'Research and design a learning path with modules and objectives',
    parameters: z.object({
      topic: z.string(),
      userBackground: z.string().optional(),
      learningGoals: z.string().optional(),
    }),
    execute: async ({ topic, userBackground, learningGoals }) => {
      // Delegates to Curriculum Agent
    }
  }),

  findResources: tool({
    description: 'Find best learning resources for an objective',
    parameters: z.object({
      objectiveId: z.string(),
      depthLevel: z.enum(['survey', 'intermediate', 'deep']),
    }),
    execute: async ({ objectiveId, depthLevel }) => {
      // Delegates to Resource Agent
    }
  }),

  updatePathStatus: tool({
    description: 'Update learning path status',
    parameters: z.object({
      pathId: z.string(),
      status: z.enum(['active', 'resting']),
    }),
    execute: async ({ pathId, status }) => {
      // Direct database update
    }
  }),
}
```

### 2. Curriculum Design Agent (Perplexity Sonar Pro)

**File:** `src/lib/ai/curriculum-agent.ts`

**Purpose:** Research existing curricula and propose structured learning paths

**Flow:**
1. User: "I want to learn machine learning"
2. Router invokes `createCurriculumPath` tool
3. Curriculum Agent (using Perplexity):
   - Asks clarifying questions (background, goals, time commitment)
   - Researches: Searches Coursera, MIT OCW, EdX, academic syllabi
   - Synthesizes: Proposes modules with dependencies (DAG)
   - Generates: Learning objectives with depth levels
   - Suggests: Concepts to link across objectives
4. Router saves to database (paths, modules, objectives, concepts)
5. Router streams response: "I've created a path with 5 modules..."

**Key Feature:** Perplexity's built-in web search eliminates need for separate search API.

### 3. Resource Collection Agent (Perplexity Sonar)

**File:** `src/lib/ai/resource-agent.ts`

**Purpose:** Find and curate best resources for specific learning objectives

**Flow:**
1. User/Router: "Find resources for 'Backpropagation' at intermediate depth"
2. Router invokes `findResources` tool
3. Resource Agent (using Perplexity Sonar):
   - Searches: YouTube lectures, academic papers, blog posts, interactive tools
   - Evaluates: Quality, pedagogical value, matches depth level
   - Extracts: Specific context (timestamps, chapters, relevant sections)
4. Returns structured resource objects
5. Router saves to database

**Example Output:**
```json
{
  "title": "3Blue1Brown - Backpropagation Calculus",
  "url": "https://youtube.com/watch?v=...",
  "type": "video",
  "why_relevant": "Visual intuition for chain rule in neural networks, excellent for building geometric understanding before diving into equations",
  "specific_context": {
    "relevantTimestamps": [
      {"start": "0:00", "end": "10:30", "topic": "Chain rule visualization"},
      {"start": "10:30", "end": "18:45", "topic": "Applying to neural networks"}
    ]
  }
}
```

### Cost Estimation

**Per curriculum design conversation (10 messages):**
- Router (Claude): ~$0.08
- Curriculum research (Perplexity Sonar Pro, 3 queries): ~$0.10
- **Total:** ~$0.18

**Per resource collection (20 objectives × 3 resources):**
- Resource searches (Perplexity Sonar, 60 queries): ~$1.44

**Monthly per active user:** ~$0.50 (after initial path creation)

---

## Next.js App Structure

```
brainstorm/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── welcome/page.tsx          # Marketing landing
│   │   │   └── auth/page.tsx             # Login/signup
│   │   ├── (protected)/
│   │   │   ├── layout.tsx                # Auth check
│   │   │   ├── dashboard/page.tsx        # Main dashboard
│   │   │   ├── paths/
│   │   │   │   ├── page.tsx              # Paths list
│   │   │   │   └── [id]/page.tsx         # Path detail
│   │   │   ├── graph/page.tsx            # Knowledge graph
│   │   │   └── chat/page.tsx             # AI conversation
│   │   ├── api/
│   │   │   └── chat/route.ts             # AI router endpoint
│   │   ├── layout.tsx                    # Root layout
│   │   ├── globals.css                   # Design tokens
│   │   └── middleware.ts                 # Auth middleware
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx         # Main chat UI
│   │   │   ├── MessageList.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── graph/
│   │   │   ├── KnowledgeGraph.tsx        # React Flow graph
│   │   │   └── GraphNode.tsx
│   │   ├── paths/
│   │   │   ├── PathCard.tsx
│   │   │   ├── ModuleList.tsx
│   │   │   └── ObjectiveCard.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser client
│   │   │   ├── server.ts                 # Server client
│   │   │   └── middleware.ts             # Auth helpers
│   │   ├── ai/
│   │   │   ├── router.ts                 # Router agent
│   │   │   ├── curriculum-agent.ts       # Curriculum design
│   │   │   └── resource-agent.ts         # Resource collection
│   │   ├── hooks/
│   │   │   ├── useLearningPaths.ts       # React Query hooks
│   │   │   ├── useModules.ts
│   │   │   └── useChat.ts
│   │   └── analytics.ts                  # PostHog setup
│   └── types/
│       └── database.ts                   # Supabase types
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql        # Database schema
│   └── config.toml                       # Supabase config
├── .env.local                            # API keys
└── package.json
```

### Server vs Client Components

**Server Components (default):**
- All `page.tsx` files fetch data directly from Supabase
- No `'use client'` directive needed
- Better performance, no client-side waterfall

**Client Components (`'use client'` directive):**
- Chat interface (streaming, interactive)
- Knowledge graph (React Flow, D3.js)
- Forms with optimistic updates
- Any component using hooks (useState, useEffect)

**API Routes (`route.ts` files):**
- Always server-side, no directive needed
- Handle AI agent orchestration
- Access secret API keys safely

---

## Metrics & Analytics

### Stack

**PostHog (Product Analytics):**
- User behavior tracking
- Funnels (signup → first path → active user)
- Session replay
- Feature flags for gradual rollouts
- **Cost:** Free tier (1M events/month)

**Custom Events Table (Business Metrics):**
- AI usage and costs per user
- Agent routing patterns
- Error tracking
- Stored in Supabase `events` table

**Vercel Analytics (Performance):**
- Core Web Vitals
- Page load times
- Edge function performance
- **Cost:** Free with Vercel deployment

### Key Metrics to Track

**User Engagement:**
- DAU / WAU / MAU
- Retention (Day 1, Day 7, Day 30)
- Paths created per user
- Session duration

**AI Usage:**
- API requests per user per day
- Cost per user (Claude + Perplexity)
- Agent routing (which agents used most)
- Failed requests / errors

**Feature Usage:**
- Graph views
- Resources added per objective
- Module state transitions

**Business Metrics:**
- Cost per active user
- Signup → First Path conversion
- Active user definition: Created path + 3 interactions in 7 days

### Implementation

```typescript
// lib/analytics.ts
import posthog from 'posthog-js'
import { createClient } from '@/lib/supabase/client'

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // PostHog (user behavior)
  posthog.capture(eventName, properties)

  // Custom events (business metrics)
  const supabase = createClient()
  supabase.from('events').insert({
    event_name: eventName,
    properties: properties || {}
  })
}

// Usage
trackEvent('path_created', {
  path_id: '123',
  modules_count: 5,
  ai_agent: 'curriculum'
})
```

---

## Service Setup Guide

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) → "Start your project"
2. Create organization → Create project
3. Set database password (save it!)
4. Wait ~2 min for provisioning
5. Get credentials (Project Settings → API):
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Secret keys → **service_role** → `SUPABASE_SERVICE_ROLE_KEY`
6. Enable auth providers (Authentication → Providers):
   - Email (default)
   - Optional: Google, GitHub OAuth

**Cost:** Free tier (500MB DB, 50k MAU)

### 2. Anthropic API

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / Log in
3. API Keys → "Create Key"
4. Name: "Brainstorm Dev"
5. Copy → `ANTHROPIC_API_KEY`
6. Add payment method (get $5 free credits)

**Cost:** Pay-as-you-go (~$0.50/user/month)

### 3. Perplexity API

1. Go to [perplexity.ai](https://www.perplexity.ai/)
2. Sign up → Settings → API
3. "Generate API Key"
4. Copy → `PERPLEXITY_API_KEY`
5. Add payment method

**Cost:** Pay-as-you-go (Sonar: $1/M tokens, Sonar Pro: $3/M tokens)

### 4. PostHog (Optional)

1. Go to [posthog.com](https://posthog.com)
2. Sign up → Create project
3. Copy Project API Key → `NEXT_PUBLIC_POSTHOG_KEY`

**Cost:** Free tier (1M events/month)

### 5. Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repository
3. Auto-detects Next.js
4. Add environment variables in dashboard
5. Deploy!

**Cost:** Free tier (generous limits)

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Next.js project setup + TypeScript config
- [ ] Supabase project + local development setup
- [ ] Database schema migration
- [ ] RLS policies
- [ ] Auth flow (signup, login, protected routes)
- [ ] Basic UI shell (sidebar, header, routing)
- [ ] Design system (Tailwind + shadcn/ui)

### Phase 2: Core Flow (Week 3-4)
- [ ] AI chat interface with streaming (Vercel AI SDK)
- [ ] Router agent implementation (Claude)
- [ ] Curriculum Design agent (Perplexity)
- [ ] Create paths/modules/objectives in database
- [ ] Paths list + detail pages
- [ ] Module CRUD with DAG validation

### Phase 3: Resources & Graph (Week 5-6)
- [ ] Resource Collection agent (Perplexity)
- [ ] Resource display + management
- [ ] Knowledge graph visualization (React Flow)
- [ ] Concept linking
- [ ] Graph node interactions (click, expand, filter)

### Phase 4: Polish (Week 7-8)
- [ ] Dashboard with stats (paths, objectives, streak)
- [ ] PostHog integration
- [ ] Error handling + loading states
- [ ] Rate limiting (10 AI requests/hour)
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deploy to Vercel

---

## Security Considerations

### Authentication
- Supabase Auth handles sessions
- Middleware redirects unauthenticated users
- Protected routes check `auth.uid()`

### Row Level Security
- All user data scoped to `user_id`
- RLS policies prevent data leaks
- Service role key only used server-side

### API Keys
- Never expose API keys client-side
- AI agents only callable via API routes
- Rate limiting to prevent abuse

### Rate Limiting
```typescript
// Implement at API route level
const { data: usageToday } = await supabase
  .from('events')
  .select('id')
  .eq('user_id', userId)
  .eq('event_name', 'ai_request')
  .gte('created_at', new Date().setHours(0, 0, 0, 0))

if (usageToday.length >= 10) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "@supabase/supabase-js": "^2.39.0",
    "ai": "^3.0.0",
    "@ai-sdk/anthropic": "^0.0.1",
    "@tanstack/react-query": "^5.0.0",
    "reactflow": "^11.10.0",
    "posthog-js": "^1.96.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "supabase": "^1.0.0"
  }
}
```

---

## Success Criteria

**MVP is successful when:**
1. ✅ User can sign up and authenticate
2. ✅ User can chat with AI to design a learning path
3. ✅ AI creates structured path with modules (DAG) and objectives
4. ✅ AI finds and curates resources for objectives
5. ✅ User can view and interact with knowledge graph
6. ✅ User can update path/module status (active, resting, exploring, deepening)
7. ✅ Dashboard shows meaningful stats
8. ✅ Analytics track key metrics (DAU, AI costs, feature usage)
9. ✅ Deployed to Vercel with <2s page load times
10. ✅ AI cost per active user stays under $1/month

---

## Next Steps

1. **Initialize project:**
   ```bash
   npx create-next-app@latest brainstorm --typescript --tailwind --app
   cd brainstorm
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs ai @ai-sdk/anthropic
   ```

2. **Set up Supabase:**
   - Create project on supabase.com
   - Run initial migration
   - Configure auth providers

3. **Start with Phase 1:**
   - Auth flow first
   - Then database schema
   - Then basic UI shell

4. **Iterate rapidly:**
   - Deploy to Vercel early (preview deployments)
   - Test AI agents with real conversations
   - Gather feedback on UX flow

---

## Questions & Decisions Log

**Q: Should concepts be user-owned or system-wide?**
**A:** System-wide (AI-created) to avoid duplication and enable future sharing.

**Q: How should modules be ordered?**
**A:** DAG structure (module_dependencies) instead of linear order, supports flexible learning paths.

**Q: Which AI models for which tasks?**
**A:** Claude Sonnet for conversation/routing (quality), Perplexity Sonar for research (built-in search).

**Q: How to track metrics?**
**A:** PostHog for product analytics + custom Supabase events table for business metrics.

---

**End of Design Document**
