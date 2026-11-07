"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/(auth)/actions";

type Field = {
  name: string;
  label: string;
  type: string;
  autoComplete?: string;
  placeholder?: string;
  max?: string;
};

export function AuthForm({
  action,
  fields,
  submitLabel,
  pendingLabel,
  footer,
  agreement,
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  fields: Field[];
  submitLabel: string;
  pendingLabel: string;
  footer: { text: string; linkText: string; href: string };
  agreement?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted">{f.label}</span>
          <input
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            placeholder={f.placeholder}
            max={f.max}
            defaultValue={state?.fields?.[f.name] ?? ""}
            required
            className="h-12 rounded-2xl border border-line bg-surface px-4 text-base text-text outline-none transition placeholder:text-muted/60 focus:border-accent/70 focus:ring-4 focus:ring-accent/15 [color-scheme:dark]"
          />
        </label>
      ))}

      {agreement && (
        <label className="flex items-start gap-3 text-sm text-muted">
          <input name="agree" type="checkbox" required defaultChecked={state?.fields?.agree === "on"} className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" />
          <span>{agreement}</span>
        </label>
      )}

      {state?.error && (
        <p role="alert" className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand mt-2 h-12 rounded-full text-base font-semibold text-white shadow-lg shadow-accent/25 transition active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>

      <p className="text-center text-sm text-muted">
        {footer.text}{" "}
        <Link href={footer.href} className="font-semibold text-text underline-offset-4 hover:underline">
          {footer.linkText}
        </Link>
      </p>
    </form>
  );
}
