"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { resetPassesAction, swipeAction } from "@/app/(app)/actions";
import type { PublicCompanion } from "@/lib/data";
import { Avatar, CompanionCard } from "./CompanionCard";
import { InfoIcon, RefreshIcon, XIcon } from "./icons";
import { HeartIcon } from "./Logo";

const SWIPE_THRESHOLD = 110;
const FLY_OUT_MS = 280;

type Drag = { x: number; y: number; dragging: boolean };

export function SwipeDeck({ initial, userName }: { initial: PublicCompanion[]; userName: string }) {
  const router = useRouter();
  const [deck, setDeck] = useState(initial);
  const [drag, setDrag] = useState<Drag>({ x: 0, y: 0, dragging: false });
  const [leaving, setLeaving] = useState<1 | -1 | null>(null);
  const [match, setMatch] = useState<PublicCompanion | null>(null);
  const [, startTransition] = useTransition();
  const origin = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const top = deck[0];
  const next = deck[1];

  const commit = useCallback(
    (dir: 1 | -1) => {
      if (!top || leaving) return;
      const liked = dir === 1;
      setLeaving(dir);
      startTransition(async () => {
        await swipeAction(top.id, liked);
      });
      window.setTimeout(() => {
        setDeck((d) => d.slice(1));
        setLeaving(null);
        setDrag({ x: 0, y: 0, dragging: false });
        if (liked) setMatch(top);
      }, FLY_OUT_MS);
    },
    [top, leaving],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (match) return;
      if (e.key === "ArrowRight") commit(1);
      if (e.key === "ArrowLeft") commit(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, match]);

  function onPointerDown(e: React.PointerEvent) {
    if (leaving) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    origin.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ x: 0, y: 0, dragging: true });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!origin.current) return;
    const x = e.clientX - origin.current.x;
    const y = e.clientY - origin.current.y;
    if (Math.abs(x) > 6 || Math.abs(y) > 6) origin.current.moved = true;
    setDrag({ x, y, dragging: true });
  }

  function onPointerUp() {
    if (!origin.current) return;
    const { moved } = origin.current;
    origin.current = null;
    if (!moved && top) {
      setDrag({ x: 0, y: 0, dragging: false });
      router.push(`/companions/${top.id}`);
      return;
    }
    if (Math.abs(drag.x) > SWIPE_THRESHOLD) commit(drag.x > 0 ? 1 : -1);
    else setDrag({ x: 0, y: 0, dragging: false });
  }

  const progress = Math.min(Math.abs(drag.x) / SWIPE_THRESHOLD, 1);
  const topTransform = leaving
    ? `translate(${leaving * 150}%, ${drag.y * 0.3}px) rotate(${leaving * 24}deg)`
    : `translate(${drag.x}px, ${drag.y * 0.3}px) rotate(${drag.x / 18}deg)`;
  const likeOpacity = leaving === 1 ? 1 : Math.max(0, Math.min(drag.x / SWIPE_THRESHOLD, 1));
  const nopeOpacity = leaving === -1 ? 1 : Math.max(0, Math.min(-drag.x / SWIPE_THRESHOLD, 1));

  if (!top) {
    return (
      <>
        <EmptyDeck />
        {match && <MatchModal companion={match} userName={userName} onClose={() => setMatch(null)} />}
      </>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        {next && (
          <div
            key={next.id}
            className="absolute inset-0 transition-transform duration-200"
            style={{ transform: `translateY(${14 - progress * 14}px) scale(${0.94 + progress * 0.06})` }}
            aria-hidden="true"
          >
            <CompanionCard companion={next} />
          </div>
        )}
        <div
          key={top.id}
          role="group"
          aria-label={`${top.name}, ${top.age}. Swipe right to like, left to pass, or tap for profile.`}
          className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
          style={{
            transform: topTransform,
            transition: drag.dragging && !leaving ? "none" : `transform ${FLY_OUT_MS}ms ease-out`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <CompanionCard companion={top} />
          <span
            className="pointer-events-none absolute top-16 left-6 -rotate-12 rounded-xl border-4 border-[#5cf2a4] px-3 py-1 text-3xl font-black tracking-wider text-[#5cf2a4]"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </span>
          <span
            className="pointer-events-none absolute top-16 right-6 rotate-12 rounded-xl border-4 border-white px-3 py-1 text-3xl font-black tracking-wider text-white"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 py-4">
        <button
          type="button"
          onClick={() => commit(-1)}
          aria-label={`Pass on ${top.name}`}
          className="grid size-16 place-items-center rounded-full border border-line bg-surface text-muted shadow-lg transition hover:text-text active:scale-90"
        >
          <XIcon className="size-7" />
        </button>
        <Link
          href={`/companions/${top.id}`}
          aria-label={`View ${top.name}'s profile`}
          className="grid size-12 place-items-center rounded-full border border-line bg-surface text-muted shadow-lg transition hover:text-text active:scale-90"
        >
          <InfoIcon className="size-6" />
        </Link>
        <button
          type="button"
          onClick={() => commit(1)}
          aria-label={`Like ${top.name}`}
          className="bg-brand grid size-16 place-items-center rounded-full text-white shadow-lg shadow-accent/30 transition active:scale-90"
        >
          <HeartIcon className="size-8" filled />
        </button>
      </div>

      {match && <MatchModal companion={match} userName={userName} onClose={() => setMatch(null)} />}
    </div>
  );
}

function EmptyDeck() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="bg-brand animate-heartbeat grid size-20 place-items-center rounded-full shadow-xl shadow-accent/30">
        <HeartIcon className="size-10 text-white" filled />
      </div>
      <h2 className="font-display mt-6 text-2xl font-semibold">You&apos;ve seen everyone for now</h2>
      <p className="mt-2 max-w-xs text-muted">New companions join regularly. Meanwhile, your matches would love to hear from you.</p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link href="/matches" className="bg-brand rounded-full py-3 font-semibold text-white shadow-lg shadow-accent/25">
          Go to my chats
        </Link>
        <form action={resetPassesAction}>
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface py-3 font-medium text-text">
            <RefreshIcon className="size-4" /> See passed profiles again
          </button>
        </form>
      </div>
    </div>
  );
}

function MatchModal({ companion, userName, onClose }: { companion: PublicCompanion; userName: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="match-title">
      <div className="animate-pop-in w-full max-w-sm text-center">
        <p id="match-title" className="font-display text-brand text-5xl font-semibold italic">
          It&apos;s a match!
        </p>
        <p className="mt-3 text-muted">You and {companion.name} liked each other.</p>
        <div className="mt-8 flex items-center justify-center">
          <span className="bg-surface-2 grid size-28 -rotate-6 place-items-center rounded-full border-4 border-bg text-4xl font-semibold shadow-xl">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span className="-ml-6 rotate-6">
            <Avatar companion={companion} className="size-28 border-4 border-bg shadow-xl" />
          </span>
        </div>
        <p className="mt-6 text-sm text-text">💌 {companion.name} already sent you a message</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href={`/chat/${companion.id}`} className="bg-brand rounded-full py-3.5 font-semibold text-white shadow-lg shadow-accent/30">
            Say hi to {companion.name}
          </Link>
          <button type="button" onClick={onClose} className="rounded-full border border-line py-3.5 font-medium text-text">
            Keep swiping
          </button>
        </div>
      </div>
    </div>
  );
}
