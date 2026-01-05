-- Admin-level RLS policies to allow admins to manage content

-- Allow admins to select/update user_profiles_extended
ALTER TABLE IF EXISTS user_profiles_extended ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can select all profiles" ON user_profiles_extended
  FOR SELECT USING (
    auth.uid() = id OR EXISTS (SELECT 1 FROM user_profiles_extended up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "Admins can update profiles" ON user_profiles_extended
  FOR UPDATE USING (
    auth.uid() = id OR EXISTS (SELECT 1 FROM user_profiles_extended up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

-- Allow admins to select/update notes
ALTER TABLE IF EXISTS notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can select all notes" ON notes
  FOR SELECT USING (
    status = 'approved' OR auth.uid() = uploader_id OR EXISTS (SELECT 1 FROM user_profiles_extended up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "Admins can update any note" ON notes
  FOR UPDATE USING (
    auth.uid() = uploader_id OR EXISTS (SELECT 1 FROM user_profiles_extended up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

-- Allow admins to delete notes if needed
CREATE POLICY IF NOT EXISTS "Admins can delete notes" ON notes
  FOR DELETE USING (EXISTS (SELECT 1 FROM user_profiles_extended up WHERE up.id = auth.uid() AND up.role = 'admin'));

-- Note: these policies assume the 'role' column in user_profiles_extended is maintained (we upsert it during login)
