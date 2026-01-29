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
