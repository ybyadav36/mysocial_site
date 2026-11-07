import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/CompanionCard";
import { listAllCompanions } from "@/lib/data";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const companions = await listAllCompanions();
  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Companions ({companions.length})</h1>
        <Link href="/admin/companions/new" className="bg-brand rounded-full px-4 py-2 text-sm font-semibold text-white">
          + New companion
        </Link>
      </div>
      <ul className="mt-4 divide-y divide-line rounded-3xl border border-line bg-surface">
        {companions.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/companions/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
              <Avatar companion={c} className="size-12" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {c.name}, {c.age}
                </span>
                <span className="block truncate text-sm text-muted">{c.tagline}</span>
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-surface-2 text-muted"}`}>
                {c.isActive ? "Live" : "Hidden"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
