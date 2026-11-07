import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { SwipeDeck } from "@/components/SwipeDeck";
import { requireUser } from "@/lib/auth";
import { getDeck } from "@/lib/data";

export const metadata: Metadata = { title: "Discover" };

export default async function DiscoverPage() {
  const user = await requireUser();
  const deck = await getDeck(user.id);
  return (
    <main className="flex h-full flex-col px-4 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <Logo />
        <span className="text-sm text-muted">{deck.length > 0 ? `${deck.length} to discover` : ""}</span>
      </header>
      <SwipeDeck initial={deck} userName={user.name} />
    </main>
  );
}
