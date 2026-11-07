import "server-only";
import { sql } from "./db";
import type { ProfilePrompt } from "@/data/companions";
import { DEFAULT_MODE, isModeKey, type ModeKey } from "./modes";

// ---------- Types ----------

export type User = {
  id: string;
  email: string;
  name: string;
  plan: string;
  createdAt: Date;
};

export type Companion = {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  tagline: string;
  bio: string;
  interests: string[];
  prompts: ProfilePrompt[];
  personality: string;
  opener: string;
  avatarUrl: string;
  theme: string;
  isActive: boolean;
  sortOrder: number;
};

/** The subset of a companion that is safe to send to the browser. */
export type PublicCompanion = Omit<Companion, "personality" | "opener" | "isActive" | "sortOrder">;

export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  mode: ModeKey;
  createdAt: Date;
};

export type MatchSummary = {
  companion: PublicCompanion;
  matchedAt: Date;
  lastMessage: string | null;
  lastMessageRole: "user" | "assistant" | null;
  lastActivity: Date;
  hasUserMessages: boolean;
};

// ---------- Row mapping ----------

type CompanionRow = {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  tagline: string;
  bio: string;
  interests: string[];
  prompts: ProfilePrompt[];
  personality: string;
  opener: string;
  avatar_url: string;
  theme: string;
  is_active: boolean;
  sort_order: number;
};

function toCompanion(row: CompanionRow): Companion {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    location: row.location,
    occupation: row.occupation,
    tagline: row.tagline,
    bio: row.bio,
    interests: row.interests ?? [],
    prompts: Array.isArray(row.prompts) ? row.prompts : [],
    personality: row.personality,
    opener: row.opener,
    avatarUrl: row.avatar_url,
    theme: row.theme,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export function toPublicCompanion(c: Companion): PublicCompanion {
  return {
    id: c.id,
    name: c.name,
    age: c.age,
    location: c.location,
    occupation: c.occupation,
    tagline: c.tagline,
    bio: c.bio,
    interests: c.interests,
    prompts: c.prompts,
    avatarUrl: c.avatarUrl,
    theme: c.theme,
  };
}

// ---------- Users ----------

export async function getUserById(id: string): Promise<User | null> {
  const rows = await sql<{ id: string; email: string; name: string; plan: string; created_at: Date }[]>`
    SELECT id, email, name, plan, created_at FROM users WHERE id = ${id}::uuid`;
  const r = rows[0];
  return r ? { id: r.id, email: r.email, name: r.name, plan: r.plan, createdAt: r.created_at } : null;
}

export async function getUserForLogin(email: string) {
  const rows = await sql<{ id: string; password_hash: string }[]>`
    SELECT id, password_hash FROM users WHERE email = ${email.toLowerCase()}`;
  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  birthdate: string;
}): Promise<string | null> {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO users (email, name, password_hash, birthdate)
    VALUES (${input.email.toLowerCase()}, ${input.name}, ${input.passwordHash}, ${input.birthdate}::date)
    ON CONFLICT (email) DO NOTHING
    RETURNING id`;
  return rows[0]?.id ?? null;
}

export async function deleteUser(userId: string): Promise<void> {
  await sql`DELETE FROM users WHERE id = ${userId}::uuid`;
}

// ---------- Companions ----------

export async function getCompanion(id: string): Promise<Companion | null> {
  const rows = await sql<CompanionRow[]>`SELECT * FROM companions WHERE id = ${id}`;
  return rows[0] ? toCompanion(rows[0]) : null;
}

export async function listAllCompanions(): Promise<Companion[]> {
  const rows = await sql<CompanionRow[]>`SELECT * FROM companions ORDER BY sort_order, name`;
  return rows.map(toCompanion);
}

/** Active companions the user hasn't liked or passed yet. */
export async function getDeck(userId: string): Promise<PublicCompanion[]> {
  const rows = await sql<CompanionRow[]>`
    SELECT c.* FROM companions c
    WHERE c.is_active
      AND NOT EXISTS (
        SELECT 1 FROM swipes s WHERE s.user_id = ${userId}::uuid AND s.companion_id = c.id
      )
    ORDER BY c.sort_order, c.name`;
  return rows.map((r) => toPublicCompanion(toCompanion(r)));
}

export type CompanionInput = Omit<Companion, "isActive" | "sortOrder"> & {
  isActive: boolean;
  sortOrder: number;
};

export async function saveCompanion(c: CompanionInput): Promise<void> {
  await sql`
    INSERT INTO companions (id, name, age, location, occupation, tagline, bio, interests, prompts,
                            personality, opener, avatar_url, theme, is_active, sort_order)
    VALUES (${c.id}, ${c.name}, ${c.age}, ${c.location}, ${c.occupation}, ${c.tagline}, ${c.bio},
            ${c.interests}::text[], ${sql.json(c.prompts)}, ${c.personality}, ${c.opener},
            ${c.avatarUrl}, ${c.theme}, ${c.isActive}, ${c.sortOrder})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, age = EXCLUDED.age, location = EXCLUDED.location,
      occupation = EXCLUDED.occupation, tagline = EXCLUDED.tagline, bio = EXCLUDED.bio,
      interests = EXCLUDED.interests, prompts = EXCLUDED.prompts, personality = EXCLUDED.personality,
      opener = EXCLUDED.opener, avatar_url = EXCLUDED.avatar_url, theme = EXCLUDED.theme,
      is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order, updated_at = now()`;
}

export async function deleteCompanion(id: string): Promise<void> {
  await sql`DELETE FROM companions WHERE id = ${id}`;
}

// ---------- Swipes & matches ----------

/**
 * Records a like or pass. A like is an instant match: it opens a conversation
 * with the companion's opening line so the chat never starts empty.
 */
export async function recordSwipe(userId: string, companion: Companion, liked: boolean): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO swipes (user_id, companion_id, liked)
      VALUES (${userId}::uuid, ${companion.id}, ${liked})
      ON CONFLICT (user_id, companion_id) DO UPDATE SET liked = EXCLUDED.liked, created_at = now()`;
    if (!liked) return;
    const created = await tx<{ id: string }[]>`
      INSERT INTO conversations (user_id, companion_id, mode)
      VALUES (${userId}::uuid, ${companion.id}, ${DEFAULT_MODE})
      ON CONFLICT (user_id, companion_id) DO NOTHING
      RETURNING id`;
    if (created[0] && companion.opener.trim()) {
      await tx`
        INSERT INTO messages (conversation_id, role, content, mode)
        VALUES (${created[0].id}::uuid, 'assistant', ${companion.opener.trim()}, ${DEFAULT_MODE})`;
    }
  });
}

export async function resetPasses(userId: string): Promise<void> {
  await sql`DELETE FROM swipes WHERE user_id = ${userId}::uuid AND NOT liked`;
}

export async function unmatch(userId: string, companionId: string): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`DELETE FROM conversations WHERE user_id = ${userId}::uuid AND companion_id = ${companionId}`;
    await tx`DELETE FROM swipes WHERE user_id = ${userId}::uuid AND companion_id = ${companionId}`;
  });
}

export async function isMatched(userId: string, companionId: string): Promise<boolean> {
  const rows = await sql`
    SELECT 1 FROM swipes WHERE user_id = ${userId}::uuid AND companion_id = ${companionId} AND liked`;
  return rows.length > 0;
}

export async function listMatches(userId: string): Promise<MatchSummary[]> {
  const rows = await sql<
    (CompanionRow & {
      matched_at: Date;
      last_content: string | null;
      last_role: "user" | "assistant" | null;
      last_at: Date | null;
      user_messages: number;
    })[]
  >`
    SELECT c.*, s.created_at AS matched_at,
           lm.content AS last_content, lm.role AS last_role, lm.created_at AS last_at,
           COALESCE(um.n, 0)::int AS user_messages
    FROM swipes s
    JOIN companions c ON c.id = s.companion_id
    LEFT JOIN conversations cv ON cv.user_id = s.user_id AND cv.companion_id = s.companion_id
    LEFT JOIN LATERAL (
      SELECT content, role, created_at FROM messages m
      WHERE m.conversation_id = cv.id ORDER BY m.id DESC LIMIT 1
    ) lm ON true
    LEFT JOIN LATERAL (
      SELECT count(*) AS n FROM messages m WHERE m.conversation_id = cv.id AND m.role = 'user'
    ) um ON true
    WHERE s.user_id = ${userId}::uuid AND s.liked
    ORDER BY COALESCE(lm.created_at, s.created_at) DESC`;
  return rows.map((r) => ({
    companion: toPublicCompanion(toCompanion(r)),
    matchedAt: r.matched_at,
    lastMessage: r.last_content,
    lastMessageRole: r.last_role,
    lastActivity: r.last_at ?? r.matched_at,
    hasUserMessages: r.user_messages > 0,
  }));
}

// ---------- Conversations ----------

export type Conversation = { id: string; mode: ModeKey };

export async function getConversation(userId: string, companionId: string): Promise<Conversation | null> {
  const rows = await sql<{ id: string; mode: string }[]>`
    SELECT id, mode FROM conversations WHERE user_id = ${userId}::uuid AND companion_id = ${companionId}`;
  const r = rows[0];
  return r ? { id: r.id, mode: isModeKey(r.mode) ? r.mode : DEFAULT_MODE } : null;
}

export async function setConversationMode(conversationId: string, mode: ModeKey): Promise<void> {
  await sql`UPDATE conversations SET mode = ${mode} WHERE id = ${conversationId}::uuid`;
}

export async function listMessages(conversationId: string, limit = 200): Promise<ChatMessage[]> {
  const rows = await sql<{ id: string; role: "user" | "assistant"; content: string; mode: string; created_at: Date }[]>`
    SELECT * FROM (
      SELECT id, role, content, mode, created_at FROM messages
      WHERE conversation_id = ${conversationId}::uuid
      ORDER BY id DESC LIMIT ${limit}
    ) recent ORDER BY id ASC`;
  return rows.map((r) => ({
    id: Number(r.id),
    role: r.role,
    content: r.content,
    mode: isModeKey(r.mode) ? r.mode : DEFAULT_MODE,
    createdAt: r.created_at,
  }));
}

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  mode: ModeKey,
): Promise<number> {
  const [row] = await sql<{ id: string }[]>`
    WITH inserted AS (
      INSERT INTO messages (conversation_id, role, content, mode)
      VALUES (${conversationId}::uuid, ${role}, ${content}, ${mode})
      RETURNING id
    ), touched AS (
      UPDATE conversations SET updated_at = now() WHERE id = ${conversationId}::uuid
    )
    SELECT id FROM inserted`;
  return Number(row.id);
}

export async function deleteMessage(id: number): Promise<void> {
  await sql`DELETE FROM messages WHERE id = ${id}`;
}

/** Messages the user has sent today (UTC), across all chats. Used for the free limit. */
export async function countUserMessagesToday(userId: string): Promise<number> {
  const [row] = await sql<{ n: number }[]>`
    SELECT count(*)::int AS n
    FROM messages m JOIN conversations c ON c.id = m.conversation_id
    WHERE c.user_id = ${userId}::uuid
      AND m.role = 'user'
      AND m.created_at >= date_trunc('day', now(), 'UTC')`;
  return row?.n ?? 0;
}
