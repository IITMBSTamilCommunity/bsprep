-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid REFERENCES user_profiles_extended(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  source text DEFAULT 'admin', -- 'admin' or 'whatsapp'
  whatsapp_msg_id text,
  is_active boolean NOT NULL DEFAULT true
);

-- Index for recency
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

-- RLS: anyone can read, only admin can insert/update/delete
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read announcements" ON announcements;
CREATE POLICY "Public can read announcements" ON announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admin can modify announcements" ON announcements;
CREATE POLICY "Only admin can modify announcements" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles_extended p WHERE p.id = auth.uid() AND p.role = 'admin')
);
