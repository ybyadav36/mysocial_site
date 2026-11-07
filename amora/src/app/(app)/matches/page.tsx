import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/CompanionCard";
import { HeartIcon } from "@/components/Logo";
import { requireUser } from "@/lib/auth";
import { listMatches } from "@/lib/data";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Chats" };

export default async function MatchesPage() {
  const user = await requireUser();
  const matches = await listMatches(user.id);
  const fresh = matches.filter((m) => !m.hasUserMessages);
  const active = matches.filter((m) => m.hasUserMessages);

  if (matches.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="bg-brand grid size-16 place-items-center rounded-full shadow-xl shadow-accent/30">
          <HeartIcon className="size-8 text-white" filled />
        </div>
        <h1 className="font-display mt-6 text-2xl font-semibold">No matches yet</h1>
        <p className="mt-2 text-muted">Like someone on Discover and she&apos;ll message you first.</p>
        <Link href="/discover" className="bg-brand mt-8 rounded-full px-8 py-3 font-semibold text-white shadow-lg shadow-accent/25">
          Start discovering
        </Link>
      </main>
    );
  }

  return (
    <main className="px-4 pt-6 pb-6">
      <h1 className="font-display text-3xl font-semibold">Chats</h1>

      {fresh.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">New matches</h2>
          <ul className="scrollbar-none -mx-4 mt-3 flex gap-4 overflow-x-auto px-4 pb-1">
            {fresh.map((m) => (
              <li key={m.companion.id} className="shrink-0">
                <Link href={`/chat/${m.companion.id}`} className="flex w-20 flex-col items-center gap-2">
                  <span className="relative">
                    <Avatar companion={m.companion} className="size-[4.5rem]" ring />
                    <span className="bg-brand absolute -right-0.5 -bottom-0.5 size-4 rounded-full border-2 border-bg" />
                  </span>
                  <span className="truncate text-sm font-medium">{m.companion.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">Messages</h2>
        {active.length === 0 ? (
          <p className="mt-4 rounded-3xl border border-dashed border-line px-5 py-6 text-center text-sm text-muted">
            Your new matches already said hi. Tap one above to reply 💬
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {active.map((m) => (
              <li key={m.companion.id}>
                <Link href={`/chat/${m.companion.id}`} className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-surface">
                  <Avatar companion={m.companion} className="size-14" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold">{m.companion.name}</span>
                      <span className="shrink-0 text-xs text-muted">{timeAgo(m.lastActivity)}</span>
                    </span>
                    <span className={`mt-0.5 block truncate text-sm ${m.lastMessageRole === "assistant" ? "text-text/90" : "text-muted"}`}>
                      {m.lastMessageRole === "user" ? "You: " : ""}
                      {m.lastMessage}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
