-- Amora database schema. Safe to run repeatedly (npm run db:setup).

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  name          text NOT NULL,
  password_hash text NOT NULL,
  birthdate     date NOT NULL,
  plan          text NOT NULL DEFAULT 'free',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- AI companions ("models") shown on the Discover screen.
CREATE TABLE IF NOT EXISTS companions (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  age         int  NOT NULL CHECK (age >= 21),
  location    text NOT NULL DEFAULT '',
  occupation  text NOT NULL DEFAULT '',
  tagline     text NOT NULL DEFAULT '',
  bio         text NOT NULL DEFAULT '',
  interests   text[] NOT NULL DEFAULT '{}',
  prompts     jsonb NOT NULL DEFAULT '[]',
  personality text NOT NULL DEFAULT '',
  opener      text NOT NULL DEFAULT '',
  avatar_url  text NOT NULL DEFAULT '',
  theme       text NOT NULL DEFAULT 'rose',
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- A like (liked = true) is a match; a pass (liked = false) hides the profile from the deck.
CREATE TABLE IF NOT EXISTS swipes (
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  companion_id text NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
  liked        boolean NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, companion_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  companion_id text NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
  mode         text NOT NULL DEFAULT 'casual',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, companion_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              bigserial PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant')),
  content         text NOT NULL,
  mode            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages (conversation_id, id);
CREATE INDEX IF NOT EXISTS messages_created_idx ON messages (created_at);
CREATE INDEX IF NOT EXISTS conversations_user_idx ON conversations (user_id, updated_at DESC);
