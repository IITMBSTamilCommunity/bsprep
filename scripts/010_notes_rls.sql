-- RLS policies for notes table

-- Enable RLS
ALTER TABLE IF EXISTS notes ENABLE ROW LEVEL SECURITY;

-- Allow admins to select all notes (this assumes admin checks are done server-side via functions or policies checking a role column)
-- We'll allow authenticated users to insert their own notes

CREATE POLICY IF NOT EXISTS "Insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY IF NOT EXISTS "Select approved or own" ON notes
  FOR SELECT USING (status = 'approved' OR auth.uid() = uploader_id);

CREATE POLICY IF NOT EXISTS "Update own notes" ON notes
  FOR UPDATE USING (auth.uid() = uploader_id);

-- Note: Admins will be expected to use server-side APIs which check role and perform updates. If you want true DB-level admin access,
-- add a policy that allows select/update for specific admin role values stored in user_profiles_extended. Example using a helper:

-- CREATE POLICY "Admins can select all" ON notes
--   FOR SELECT USING (EXISTS (SELECT 1 FROM user_profiles_extended up WHERE up.id = auth.uid() AND up.role = 'admin'));
