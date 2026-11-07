import "server-only";
import postgres from "postgres";

// One connection pool per server process (reused across hot reloads in dev).
const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL ?? "postgres://localhost:5432/amora", {
    max: 5,
    // Works with pooled connection strings (Neon / Supabase / PgBouncer).
    prepare: false,
    idle_timeout: 20,
    onnotice: () => {},
  });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
