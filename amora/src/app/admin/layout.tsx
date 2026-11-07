import Link from "next/link";
import { BackIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-16">
      <header className="mb-6 flex items-center gap-3">
        <Link href="/profile" aria-label="Back to app" className="grid size-10 place-items-center rounded-full text-muted hover:bg-surface hover:text-text">
          <BackIcon className="size-5" />
        </Link>
        <Link href="/admin" className="font-display text-2xl font-semibold">
          Admin
        </Link>
      </header>
      {children}
    </div>
  );
}
