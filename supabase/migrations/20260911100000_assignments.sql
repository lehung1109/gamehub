CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) <= 200),
  description text DEFAULT '',
  game_type text NOT NULL,
  topic text DEFAULT '',
  config_id text,
  target_score integer DEFAULT 0,
  due_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage assignments in their classrooms"
ON assignments
FOR ALL
USING (EXISTS (
  SELECT 1 FROM classrooms c WHERE c.id = assignments.classroom_id AND c.teacher_id = auth.uid()
));

CREATE INDEX IF NOT EXISTS idx_assignments_classroom_id ON assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
