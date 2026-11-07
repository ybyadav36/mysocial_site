import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { deleteAccountAction } from "@/app/(app)/actions";
import { isAdmin, requireUser } from "@/lib/auth";
import { listMatches } from "@/lib/data";
import { getUsage } from "@/lib/limits";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const [usage, matches] = await Promise.all([getUsage(user), listMatches(user.id)]);
  const premium = user.plan === "premium";

  return (
    <main className="px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl font-semibold">Profile</h1>

      <section className="mt-6 flex items-center gap-4 rounded-3xl border border-line bg-surface p-5">
        <span className="bg-brand grid size-16 shrink-0 place-items-center rounded-full text-2xl font-semibold text-white">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold">{user.name}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${premium ? "bg-brand text-white" : "bg-surface-2 text-muted"}`}>
            {premium ? "Premium" : "Free plan"}
          </span>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <p className="text-3xl font-semibold">{matches.length}</p>
          <p className="mt-1 text-sm text-muted">Matches</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5">
          <p className="text-3xl font-semibold">
            {usage.used}
            {usage.limit !== null && <span className="text-lg font-normal text-muted"> / {usage.limit}</span>}
          </p>
          <p className="mt-1 text-sm text-muted">Messages today</p>
        </div>
      </section>

      {usage.limit !== null && (
        <p className="mt-3 px-1 text-sm text-muted">
          Free accounts get {usage.limit} messages a day. Your allowance resets at midnight UTC.
        </p>
      )}

      <section className="mt-8 flex flex-col gap-3">
        {isAdmin(user) && (
          <Link href="/admin" className="rounded-full border border-line bg-surface py-3 text-center font-medium">
            Manage companions (admin)
          </Link>
        )}
        <Link href="/terms" className="rounded-full border border-line bg-surface py-3 text-center font-medium">
          Terms &amp; safety
        </Link>
        <form action={logout}>
          <button type="submit" className="w-full rounded-full border border-line bg-surface py-3 font-medium">
            Log out
          </button>
        </form>
      </section>

      <details className="mt-10 rounded-3xl border border-line px-5 py-4 text-sm">
        <summary className="cursor-pointer text-muted">Delete account</summary>
        <p className="mt-3 text-muted">This permanently deletes your account, matches and every chat. It can&apos;t be undone.</p>
        <form action={deleteAccountAction} className="mt-4">
          <button type="submit" className="w-full rounded-full bg-red-500/15 py-3 font-semibold text-red-300">
            Yes, delete everything
          </button>
        </form>
      </details>
    </main>
  );
}
