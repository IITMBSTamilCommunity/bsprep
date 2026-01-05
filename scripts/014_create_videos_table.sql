-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  public_url TEXT,
  thumbnail TEXT,
  is_premium BOOLEAN DEFAULT false,
  category TEXT,
  duration_seconds INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_is_premium ON videos(is_premium);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
