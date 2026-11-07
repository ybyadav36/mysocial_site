"use client";

import Link from "next/link";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { setModeAction } from "@/app/chat/actions";
import type { ChatStreamEvent } from "@/lib/chat-events";
import type { PublicCompanion } from "@/lib/data";
import { MODES, MODE_KEYS, type ModeKey } from "@/lib/modes";
import { Avatar } from "./CompanionCard";
import { BackIcon, SendIcon } from "./icons";

type Msg = { id: number; role: "user" | "assistant"; content: string; mode: ModeKey };

class ChatError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
  }
}

let tempId = -1;

export function ChatView({
  companion,
  initialMode,
  initialMessages,
  initialRemaining,
  dailyLimit,
}: {
  companion: PublicCompanion;
  initialMode: ModeKey;
  initialMessages: Msg[];
  initialRemaining: number | null;
  dailyLimit: number | null;
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [mode, setMode] = useState<ModeKey>(initialMode);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(initialRemaining);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const outOfMessages = remaining === 0;

  // Keep the newest message in view.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming, busy]);

  // Grow the text box with its content (up to ~5 lines).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  function changeMode(next: ModeKey) {
    if (next === mode) return;
    setMode(next);
    void setModeAction(companion.id, next);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy || outOfMessages) return;
    setInput("");
    setError(null);
    setBusy(true);
    setStreaming(null);
    const pendingId = tempId--;
    let savedId: number | null = null;
    const remainingBefore = remaining;
    setMessages((m) => [...m, { id: pendingId, role: "user", content: text, mode }]);

    try {
      const res = await fetch(`/api/chat/${companion.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
        throw new ChatError(data.error ?? "Couldn't send that. Try again.", data.code);
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let reply = "";
      let finished = false;
      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        let newline: number;
        while ((newline = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (!line) continue;
          const event = JSON.parse(line) as ChatStreamEvent;
          if (event.type === "start") {
            savedId = event.userMessageId;
            setRemaining(event.remaining);
            setMessages((m) => m.map((x) => (x.id === pendingId ? { ...x, id: event.userMessageId } : x)));
          } else if (event.type === "delta") {
            reply += event.text;
            setStreaming(reply);
          } else if (event.type === "replace") {
            reply = event.text;
            setStreaming(reply);
          } else if (event.type === "done") {
            const finalReply = reply.trim();
            setMessages((m) => [...m, { id: event.messageId, role: "assistant", content: finalReply, mode }]);
            finished = true;
          } else if (event.type === "error") {
            throw new ChatError(event.message);
          }
        }
      }
      if (!finished) throw new ChatError("The connection dropped. Try again.");
    } catch (err) {
      // The server discards a message that got no reply, so drop it here too and
      // put the text back in the box so it can be re-sent.
      setMessages((m) => m.filter((x) => x.id !== pendingId && x.id !== savedId));
      setInput(text);
      if (savedId !== null) setRemaining(remainingBefore);
      if (err instanceof ChatError) {
        setError(err.message);
        if (err.code === "daily_limit") setRemaining(0);
      } else {
        setError("Couldn't reach the server. Check your connection and try again.");
      }
    } finally {
      setStreaming(null);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-line px-3 py-2.5">
        <Link href="/matches" aria-label="Back to chats" className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-text">
          <BackIcon className="size-5" />
        </Link>
        <Link href={`/companions/${companion.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar companion={companion} className="size-10" />
          <span className="min-w-0">
            <span className="block truncate leading-tight font-semibold">{companion.name}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span className="size-2 rounded-full bg-emerald-400" /> AI companion · {MODES[mode].label} mode
            </span>
          </span>
        </Link>
      </header>

      <div className="shrink-0 border-b border-line">
        <div role="radiogroup" aria-label="Chat mode" className="scrollbar-none flex gap-2 overflow-x-auto px-3 py-2.5">
          {MODE_KEYS.map((key) => {
            const active = key === mode;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => changeMode(key)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active ? "bg-brand text-white shadow-md shadow-accent/25" : "border border-line bg-surface text-muted hover:text-text"
                }`}
              >
                <span aria-hidden="true">{MODES[key].emoji}</span> {MODES[key].label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-5 flex flex-col items-center text-center">
          <Avatar companion={companion} className="size-20" />
          <p className="mt-2 font-semibold">You matched with {companion.name}</p>
          <p className="mt-0.5 max-w-64 text-xs text-muted">
            {companion.name} is an AI character. Pick a mode above to change the vibe anytime.
          </p>
        </div>

        <ol className="flex flex-col gap-1.5">
          {messages.map((msg, i) => {
            const prev = messages[i - 1];
            const modeChanged = msg.role === "user" && prev && prev.mode !== msg.mode;
            return (
              <Fragment key={msg.id}>
                {modeChanged && <ModeDivider mode={msg.mode} />}
                <Bubble msg={msg} companion={companion} groupEnd={messages[i + 1]?.role !== msg.role} />
              </Fragment>
            );
          })}
          {busy &&
            (streaming ? (
              <Bubble msg={{ id: 0, role: "assistant", content: streaming, mode }} companion={companion} groupEnd />
            ) : (
              <TypingIndicator companion={companion} />
            ))}
          {!busy && messages.at(-1)?.mode !== mode && <ModeDivider mode={mode} hint />}
        </ol>
      </div>

      <div className="pb-safe shrink-0 border-t border-line bg-bg px-3 pt-2.5">
        {error && (
          <p role="alert" className="mb-2 rounded-2xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-sm">
            {error}
          </p>
        )}
        {remaining !== null && remaining <= 5 && !outOfMessages && (
          <p className="mb-2 text-center text-xs text-muted">
            {remaining} free {remaining === 1 ? "message" : "messages"} left today
          </p>
        )}
        {outOfMessages ? (
          <div className="rounded-3xl border border-line bg-surface px-4 py-4 text-center">
            <p className="font-semibold">You&apos;ve used today&apos;s {dailyLimit} free messages</p>
            <p className="mt-1 text-sm text-muted">{companion.name} will be here tomorrow. Your allowance resets at midnight UTC.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={`Message ${companion.name}…`}
              aria-label={`Message ${companion.name}`}
              className="max-h-36 min-h-11 flex-1 resize-none rounded-3xl border border-line bg-surface px-4 py-2.5 text-base leading-6 text-text outline-none placeholder:text-muted/70 focus:border-accent/60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="bg-brand grid size-11 shrink-0 place-items-center rounded-full text-white shadow-lg shadow-accent/25 transition active:scale-90 disabled:opacity-40 disabled:shadow-none"
            >
              <SendIcon className="size-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Bubble({ msg, companion, groupEnd }: { msg: Msg; companion: PublicCompanion; groupEnd: boolean }) {
  const mine = msg.role === "user";
  // Companion replies with blank lines read like separate texts.
  const parts = mine ? [msg.content] : msg.content.split(/\n{2,}/).filter(Boolean);
  return (
    <li className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} ${groupEnd ? "mb-2" : ""}`}>
      {!mine && (
        <span className={`w-7 shrink-0 ${groupEnd ? "" : "invisible"}`}>
          <Avatar companion={companion} className="size-7" />
        </span>
      )}
      <span className={`flex max-w-[78%] flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
        {parts.map((part, i) => (
          <span
            key={i}
            className={`rounded-3xl px-4 py-2.5 text-[15px] leading-snug break-words whitespace-pre-wrap ${
              mine ? "bg-brand rounded-br-lg text-white" : "rounded-bl-lg bg-surface-2 text-text"
            }`}
          >
            {part}
          </span>
        ))}
      </span>
    </li>
  );
}

function TypingIndicator({ companion }: { companion: PublicCompanion }) {
  return (
    <li className="mb-2 flex items-end gap-2" aria-label={`${companion.name} is typing`}>
      <Avatar companion={companion} className="size-7" />
      <span className="flex gap-1 rounded-3xl rounded-bl-lg bg-surface-2 px-4 py-3.5">
        <span className="typing-dot size-2 rounded-full bg-muted" />
        <span className="typing-dot size-2 rounded-full bg-muted" />
        <span className="typing-dot size-2 rounded-full bg-muted" />
      </span>
    </li>
  );
}

function ModeDivider({ mode, hint = false }: { mode: ModeKey; hint?: boolean }) {
  return (
    <li className="my-3 flex list-none items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-line" />
      <span className="text-center">
        {MODES[mode].emoji} {hint ? `${MODES[mode].label} mode on · ${MODES[mode].blurb}` : `Switched to ${MODES[mode].label}`}
      </span>
      <span className="h-px flex-1 bg-line" />
    </li>
  );
}
