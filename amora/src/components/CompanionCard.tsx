/* eslint-disable @next/next/no-img-element */
import type { PublicCompanion } from "@/lib/data";
import { themeGradient } from "@/lib/themes";
import { BriefcaseIcon, PinIcon, SparkleIcon } from "./icons";

export function AiBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase backdrop-blur-md ${className}`}>
      <SparkleIcon className="size-3" /> AI companion
    </span>
  );
}

export function Avatar({
  companion,
  className = "size-12",
  ring = false,
}: {
  companion: Pick<PublicCompanion, "name" | "avatarUrl" | "theme">;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full ${ring ? "ring-2 ring-accent ring-offset-2 ring-offset-bg" : ""} ${className}`}
      style={{ backgroundImage: themeGradient(companion.theme) }}
    >
      {companion.avatarUrl && (
        <img src={companion.avatarUrl} alt={companion.name} className="absolute inset-0 size-full object-cover object-top" draggable={false} />
      )}
    </span>
  );
}

/** The big profile card used on the Discover deck. */
export function CompanionCard({ companion }: { companion: PublicCompanion }) {
  return (
    <div className="relative size-full overflow-hidden rounded-[2rem] shadow-2xl shadow-black/50 select-none" style={{ backgroundImage: themeGradient(companion.theme) }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.28),transparent_60%)]" />
      {companion.avatarUrl && (
        <img
          src={companion.avatarUrl}
          alt=""
          draggable={false}
          className="absolute inset-x-0 top-[3%] mx-auto h-[66%] max-w-[92%] object-contain object-top drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)]"
        />
      )}
      <AiBadge className="absolute top-4 left-4" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-5 pt-24 pb-5">
        <h2 className="font-display text-[2rem] leading-none font-semibold">
          {companion.name} <span className="font-sans text-2xl font-normal text-white/85">{companion.age}</span>
        </h2>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-white/80">
          <span className="inline-flex items-center gap-1">
            <BriefcaseIcon className="size-4" /> {companion.occupation}
          </span>
          <span className="inline-flex items-center gap-1">
            <PinIcon className="size-4" /> {companion.location}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-[15px] leading-snug text-white">{companion.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {companion.interests.slice(0, 4).map((i) => (
            <span key={i} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
              {i}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
