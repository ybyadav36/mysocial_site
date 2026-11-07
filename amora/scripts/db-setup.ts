// Creates the tables (if missing) and adds the starter companions.
//   npm run db:setup            -> add companions that don't exist yet (keeps your admin edits)
//   npm run db:setup -- --force -> also overwrite existing starter companions from src/data/companions.ts
import postgres from "postgres";
import { readFileSync } from "node:fs";
import { COMPANIONS } from "../src/data/companions";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const force = process.argv.includes("--force");
const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });

async function main() {
  await sql.unsafe(readFileSync("db/schema.sql", "utf8"));
  console.log("✓ schema is up to date");

  let added = 0;
  for (const c of COMPANIONS) {
    const onConflict = force
      ? sql`DO UPDATE SET
          name = EXCLUDED.name, age = EXCLUDED.age, location = EXCLUDED.location,
          occupation = EXCLUDED.occupation, tagline = EXCLUDED.tagline, bio = EXCLUDED.bio,
          interests = EXCLUDED.interests, prompts = EXCLUDED.prompts, personality = EXCLUDED.personality,
          opener = EXCLUDED.opener, avatar_url = EXCLUDED.avatar_url, theme = EXCLUDED.theme,
          sort_order = EXCLUDED.sort_order, updated_at = now()`
      : sql`DO NOTHING`;
    const result = await sql`
      INSERT INTO companions (id, name, age, location, occupation, tagline, bio, interests, prompts,
                              personality, opener, avatar_url, theme, sort_order)
      VALUES (${c.id}, ${c.name}, ${c.age}, ${c.location}, ${c.occupation}, ${c.tagline}, ${c.bio},
              ${c.interests}::text[], ${sql.json(c.prompts)}, ${c.personality}, ${c.opener},
              ${c.avatarUrl}, ${c.theme}, ${c.sortOrder})
      ON CONFLICT (id) ${onConflict}`;
    added += result.count;
  }
  console.log(`✓ companions: ${added} ${force ? "added or updated" : "added"} (${COMPANIONS.length} in seed file)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
