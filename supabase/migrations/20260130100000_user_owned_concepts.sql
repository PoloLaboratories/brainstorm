-- Migration: Make concepts user-owned and add junction tables
-- Step 1: Alter concepts table

-- Add user_id column (nullable initially for migration)
ALTER TABLE concepts ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add updated_at column
ALTER TABLE concepts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop old unique constraint on name
ALTER TABLE concepts DROP CONSTRAINT IF EXISTS concepts_name_key;

-- Drop legacy columns
ALTER TABLE concepts DROP COLUMN IF EXISTS created_by;
ALTER TABLE concepts DROP COLUMN IF EXISTS verified;
ALTER TABLE concepts DROP COLUMN IF EXISTS usage_count;

-- Delete orphan rows with no user
DELETE FROM concepts WHERE user_id IS NULL;

-- Make user_id NOT NULL after cleanup
ALTER TABLE concepts ALTER COLUMN user_id SET NOT NULL;

-- Add per-user unique constraint
ALTER TABLE concepts ADD CONSTRAINT concepts_user_id_name_key UNIQUE (user_id, name);

-- Create index for user lookups
CREATE INDEX idx_concepts_user_id ON concepts(user_id);

-- Auto-update updated_at trigger
CREATE TRIGGER set_concepts_updated_at
  BEFORE UPDATE ON concepts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 2: Replace RLS on concepts

DROP POLICY IF EXISTS "Anyone can read concepts" ON concepts;

CREATE POLICY "Users can CRUD own concepts"
  ON concepts FOR ALL
  USING (auth.uid() = user_id);

-- Step 3: Add junction tables

-- Concept <-> Path
CREATE TABLE concept_paths (
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE NOT NULL,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (concept_id, path_id)
);

ALTER TABLE concept_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own concept_paths"
  ON concept_paths FOR ALL
  USING (
    EXISTS (SELECT 1 FROM concepts WHERE id = concept_id AND user_id = auth.uid())
  );

-- Concept <-> Module
CREATE TABLE concept_modules (
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (concept_id, module_id)
);

ALTER TABLE concept_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own concept_modules"
  ON concept_modules FOR ALL
  USING (
    EXISTS (SELECT 1 FROM concepts WHERE id = concept_id AND user_id = auth.uid())
  );

-- Enable RLS on existing concept_objectives
ALTER TABLE concept_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own concept_objectives"
  ON concept_objectives FOR ALL
  USING (
    EXISTS (SELECT 1 FROM concepts WHERE id = concept_id AND user_id = auth.uid())
  );

-- Step 4: Update graph_edges constraints to include 'concept' node type

ALTER TABLE graph_edges DROP CONSTRAINT IF EXISTS graph_edges_source_type_check;
ALTER TABLE graph_edges ADD CONSTRAINT graph_edges_source_type_check
  CHECK (source_type IN ('objective', 'concept', 'project', 'idea'));

ALTER TABLE graph_edges DROP CONSTRAINT IF EXISTS graph_edges_target_type_check;
ALTER TABLE graph_edges ADD CONSTRAINT graph_edges_target_type_check
  CHECK (target_type IN ('objective', 'concept', 'project', 'idea'));

ALTER TABLE graph_edges DROP CONSTRAINT IF EXISTS graph_edges_relationship_check;
ALTER TABLE graph_edges ADD CONSTRAINT graph_edges_relationship_check
  CHECK (relationship IN ('prerequisite', 'enables', 'relates', 'same_concept'));
