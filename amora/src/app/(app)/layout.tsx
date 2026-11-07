import { BottomNav } from "@/components/BottomNav";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="flex h-dvh flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex h-full w-full max-w-md flex-col">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
