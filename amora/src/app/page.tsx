/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";
import { AiBadge } from "@/components/CompanionCard";
import { Logo } from "@/components/Logo";
import { COMPANIONS } from "@/data/companions";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import { MODES, MODE_KEYS } from "@/lib/modes";
import { themeGradient } from "@/lib/themes";

export default async function LandingPage() {
  if (await getCurrentUser()) redirect("/discover");
  const [left, center, right] = [COMPANIONS[1], COMPANIONS[0], COMPANIONS[4]];

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden px-6 pt-8 pb-safe">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />

      <header className="relative flex items-center justify-between">
        <Logo />
        <Link href="/login" className="text-sm font-semibold text-muted hover:text-text">
          Log in
        </Link>
      </header>

      <div className="relative mt-10 h-72">
        {[
          { c: left, cls: "left-0 top-6 -rotate-[10deg] scale-90" },
          { c: right, cls: "right-0 top-6 rotate-[10deg] scale-90" },
          { c: center, cls: "left-1/2 top-0 -translate-x-1/2 z-10" },
        ].map(({ c, cls }) => (
          <div
            key={c.id}
            className={`absolute h-64 w-44 overflow-hidden rounded-3xl shadow-2xl shadow-black/60 ${cls}`}
            style={{ backgroundImage: themeGradient(c.theme) }}
          >
            <img src={c.avatarUrl} alt="" className="absolute inset-x-0 top-3 mx-auto w-[92%]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-10 pb-3">
              <p className="font-display text-xl font-semibold">
                {c.name} <span className="font-sans text-base font-normal text-white/80">{c.age}</span>
              </p>
              <p className="truncate text-xs text-white/75">{c.location}</p>
            </div>
          </div>
        ))}
        <AiBadge className="absolute -bottom-3 left-1/2 z-20 -translate-x-1/2" />
      </div>

      <h1 className="font-display relative mt-12 text-[2.6rem] leading-[1.05] font-semibold tracking-tight">
        Swipe. Match. <span className="text-brand italic">Actually talk.</span>
      </h1>
      <p className="relative mt-4 text-lg leading-relaxed text-muted">
        {APP_NAME} is a dating-style app where every profile is an AI companion with her own personality. Like the
        ones you vibe with and pick how you want to chat.
      </p>

      <ul className="relative mt-6 flex flex-wrap gap-2">
        {MODE_KEYS.map((key) => (
          <li key={key} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm">
            {MODES[key].emoji} {MODES[key].label}
          </li>
        ))}
      </ul>

      <div className="relative mt-auto flex flex-col gap-3 pt-10">
        <Link href="/signup" className="bg-brand rounded-full py-4 text-center text-lg font-semibold text-white shadow-xl shadow-accent/30 transition active:scale-[0.98]">
          Create free account
        </Link>
        <Link href="/login" className="rounded-full border border-line bg-surface py-4 text-center font-semibold">
          I already have an account
        </Link>
        <p className="mt-2 text-center text-xs text-muted">
          18+ only. All profiles are fictional AI characters. <Link href="/terms" className="underline underline-offset-2">Terms</Link>
        </p>
      </div>
    </main>
  );
}
