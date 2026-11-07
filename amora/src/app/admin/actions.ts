"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { deleteCompanion, getCompanion, saveCompanion } from "@/lib/data";
import { THEMES } from "@/lib/themes";

export type CompanionFormState = { error?: string } | undefined;

const Schema = z.object({
  id: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,40}$/, "ID: 2–40 lowercase letters, numbers or dashes (used in links)."),
  name: z.string().trim().min(1, "Name is required.").max(40),
  age: z.coerce.number().int().min(21, "Companions must be 21 or older.").max(99),
  location: z.string().trim().max(80),
  occupation: z.string().trim().max(80),
  tagline: z.string().trim().max(140),
  bio: z.string().trim().max(1000),
  interests: z.string().max(400),
  prompts: z.string().max(2000),
  personality: z.string().trim().min(10, "Describe her personality so the AI knows how to talk.").max(3000),
  opener: z.string().trim().max(300),
  avatarUrl: z.string().trim().max(500),
  theme: z.enum(Object.keys(THEMES) as [string, ...string[]]),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.string().optional(),
  isNew: z.string().optional(),
});

export async function saveCompanionAction(_prev: CompanionFormState, formData: FormData): Promise<CompanionFormState> {
  await requireAdmin();
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  if (d.isNew && (await getCompanion(d.id))) return { error: `A companion with ID "${d.id}" already exists.` };

  const prompts = d.prompts
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter(([q, a]) => q && a)
    .map(([q, a]) => ({ q, a }));

  await saveCompanion({
    id: d.id,
    name: d.name,
    age: d.age,
    location: d.location,
    occupation: d.occupation,
    tagline: d.tagline,
    bio: d.bio,
    interests: d.interests.split(",").map((s) => s.trim()).filter(Boolean),
    prompts,
    personality: d.personality,
    opener: d.opener,
    avatarUrl: d.avatarUrl,
    theme: d.theme,
    sortOrder: d.sortOrder,
    isActive: d.isActive === "on",
  });
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteCompanionAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteCompanion(id);
  revalidatePath("/", "layout");
  redirect("/admin");
}
