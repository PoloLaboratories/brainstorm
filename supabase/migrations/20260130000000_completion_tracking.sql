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
