-- Add is_premium to user_profiles_extended
ALTER TABLE IF EXISTS user_profiles_extended
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_premium ON user_profiles_extended(is_premium);
