# Supabase Setup

## Completed Steps

✅ `npx supabase init` - Local Supabase initialized
✅ Migration file created: `migrations/20260129000000_initial_schema.sql`
✅ Changes committed to git

## Remaining Steps (Requires Credentials)

The following steps require Supabase access credentials and should be completed when ready:

### 1. Get Supabase Access Token

Go to: https://supabase.com/dashboard/account/tokens
Generate a new access token or use an existing one.

### 2. Link to Remote Project

```bash
# Option A: Set environment variable
export SUPABASE_ACCESS_TOKEN=<your-token>
npx supabase link --project-ref vqbhtgjksathzvixrtqq

# Option B: Use token flag directly
npx supabase link --project-ref vqbhtgjksathzvixrtqq --token <your-token>
```

When prompted for database password, use the password from Supabase dashboard.

### 3. Run Migration Locally

```bash
npx supabase db reset
```

This will:
- Start local Supabase (PostgreSQL + other services)
- Apply all migrations
- Seed the database (if seed files exist)

### 4. Push Migration to Remote

```bash
npx supabase db push
```

This deploys the schema to your production Supabase project.

### 5. Generate TypeScript Types

```bash
npx supabase gen types typescript --local > app/types/database.ts
```

This creates TypeScript types from your database schema for type-safe queries.

### 6. Commit Types

```bash
git add app/types/database.ts
git commit -m "feat(types): generate database types from Supabase schema"
```

## Database Schema Overview

The migration creates the following tables:

**Core Learning Entities:**
- `learning_paths` - User's learning journeys
- `modules` - Units within a path
- `module_dependencies` - DAG of module prerequisites
- `learning_objectives` - Specific goals within modules
- `resources` - Learning materials for objectives

**Knowledge Graph:**
- `concepts` - Reusable knowledge units (system-owned)
- `concept_objectives` - Links concepts to objectives
- `user_concept_notes` - User's personal notes on concepts
- `graph_edges` - Relationships between knowledge nodes

**AI & Analytics:**
- `ai_messages` - Conversation history with AI
- `events` - Analytics events

**Security:**
- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Concepts are read-only for users

**Performance:**
- Indexes on foreign keys and frequently queried columns
- Triggers for automatic `updated_at` timestamp updates
