import { APP_NAME } from "@/lib/config";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const text = size === "lg" ? "text-4xl" : "text-2xl";
  const icon = size === "lg" ? "size-10" : "size-7";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`bg-brand grid ${icon} place-items-center rounded-xl shadow-lg shadow-accent/30`}>
        <HeartIcon className="size-[60%] text-white" filled />
      </span>
      <span className={`font-display ${text} font-semibold tracking-tight italic`}>{APP_NAME}</span>
    </span>
  );
}

export function HeartIcon({ className, filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4Z" />
    </svg>
  );
}
