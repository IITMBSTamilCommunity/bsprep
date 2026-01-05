-- Add email and role columns to user_profiles_extended

ALTER TABLE IF EXISTS user_profiles_extended
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE IF EXISTS user_profiles_extended
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles_extended(role);
