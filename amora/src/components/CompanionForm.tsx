"use client";

import { useActionState } from "react";
import { saveCompanionAction } from "@/app/admin/actions";
import type { Companion } from "@/lib/data";
import { THEMES } from "@/lib/themes";

const input =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3 text-base text-text outline-none focus:border-accent/70";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function CompanionForm({ companion }: { companion?: Companion }) {
  const [state, action, pending] = useActionState(saveCompanionAction, undefined);
  const c = companion;

  return (
    <form action={action} className="flex flex-col gap-5">
      {!c && <input type="hidden" name="isNew" value="1" />}
      <div className="grid grid-cols-2 gap-4">
        <Field label="ID" hint="Used in links, e.g. 'aria'. Can't change later.">
          <input name="id" defaultValue={c?.id} readOnly={!!c} required className={`${input} ${c ? "opacity-60" : ""}`} />
        </Field>
        <Field label="Name">
          <input name="name" defaultValue={c?.name} required className={input} />
        </Field>
        <Field label="Age" hint="21 or older.">
          <input name="age" type="number" min={21} max={99} defaultValue={c?.age ?? 24} required className={input} />
        </Field>
        <Field label="Location">
          <input name="location" defaultValue={c?.location} className={input} />
        </Field>
      </div>
      <Field label="Occupation">
        <input name="occupation" defaultValue={c?.occupation} className={input} />
      </Field>
      <Field label="Tagline" hint="One line shown on her card.">
        <input name="tagline" defaultValue={c?.tagline} className={input} />
      </Field>
      <Field label="Bio">
        <textarea name="bio" rows={3} defaultValue={c?.bio} className={input} />
      </Field>
      <Field label="Interests" hint="Comma separated, e.g. Music, Coffee, Travel">
        <input name="interests" defaultValue={c?.interests.join(", ")} className={input} />
      </Field>
      <Field label="Profile prompts" hint="One per line: Question | Answer">
        <textarea name="prompts" rows={3} defaultValue={c?.prompts.map((p) => `${p.q} | ${p.a}`).join("\n")} className={input} />
      </Field>
      <Field label="Personality (instructions for the AI)" hint="How she talks: tone, slang, emoji, what she loves talking about.">
        <textarea name="personality" rows={5} defaultValue={c?.personality} required className={input} />
      </Field>
      <Field label="Opening message" hint="Sent automatically when someone matches with her.">
        <input name="opener" defaultValue={c?.opener} className={input} />
      </Field>
      <Field label="Profile picture URL" hint="Any image link (https://…) or a file in /public, e.g. /avatars/aria.svg">
        <input name="avatarUrl" defaultValue={c?.avatarUrl} className={input} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Card color">
          <select name="theme" defaultValue={c?.theme ?? "rose"} className={input}>
            {Object.entries(THEMES).map(([key, t]) => (
              <option key={key} value={key}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Order" hint="Lower shows first.">
          <input name="sortOrder" type="number" min={0} defaultValue={c?.sortOrder ?? 100} className={input} />
        </Field>
      </div>
      <label className="flex items-center gap-3">
        <input name="isActive" type="checkbox" defaultChecked={c?.isActive ?? true} className="size-5 accent-[var(--accent)]" />
        <span className="text-sm font-medium">Live (visible to users)</span>
      </label>

      {state?.error && (
        <p role="alert" className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="bg-brand h-12 rounded-full font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Save companion"}
      </button>
    </form>
  );
}
