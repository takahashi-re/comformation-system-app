CREATE TABLE IF NOT EXISTS scout_documents (
  id SERIAL PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  scout_title TEXT NOT NULL,
  scout_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by TEXT NOT NULL,
  decision_comment TEXT,
  decided_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
