-- Proctoring tables: sessions and logs

CREATE TABLE IF NOT EXISTS proctor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  quiz_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS proctor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES proctor_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proctor_session_user ON proctor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_proctor_logs_session ON proctor_logs(session_id);
