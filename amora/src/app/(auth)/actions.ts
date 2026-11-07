"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createUser, getUserForLogin } from "@/lib/data";
import { createSession, destroySession } from "@/lib/session";

export type AuthState = { error?: string; fields?: Record<string, string> } | undefined;

const MIN_AGE = 18;

function ageOn(birthdate: Date, today = new Date()): number {
  let age = today.getUTCFullYear() - birthdate.getUTCFullYear();
  const m = today.getUTCMonth() - birthdate.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < birthdate.getUTCDate())) age--;
  return age;
}

const SignupSchema = z.object({
  name: z.string().trim().min(1, "Tell us your first name.").max(40, "Name is too long."),
  email: z.email("Enter a valid email address.").max(200),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
  birthdate: z.iso.date("Enter your date of birth."),
  agree: z.literal("on", { error: "Please confirm you're 18+ and accept the terms." }),
});

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const fields = { name: raw.name ?? "", email: raw.email ?? "", birthdate: raw.birthdate ?? "", agree: raw.agree ?? "" };
  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };

  const { name, email, password, birthdate } = parsed.data;
  const age = ageOn(new Date(`${birthdate}T00:00:00Z`));
  if (age < MIN_AGE) return { error: `You must be ${MIN_AGE} or older to use this app.`, fields };
  if (age > 120) return { error: "Please enter your real date of birth.", fields };

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = await createUser({ email, name, passwordHash, birthdate });
  if (!userId) return { error: "An account with that email already exists. Try logging in.", fields };

  await createSession(userId);
  redirect("/discover");
}

const LoginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const fields = { email: raw.email ?? "" };
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };

  const user = await getUserForLogin(parsed.data.email);
  const ok = user ? await bcrypt.compare(parsed.data.password, user.password_hash) : false;
  if (!user || !ok) return { error: "Wrong email or password.", fields };

  await createSession(user.id);
  redirect("/discover");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
