-- Cloudflare D1 community DB (roles family|medic, invite groups)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT,
  group_id TEXT,
  display_name TEXT,
  invited_by TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  owner_id TEXT NOT NULL,
  role TEXT NOT NULL,
  title TEXT,
  members_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(code);
