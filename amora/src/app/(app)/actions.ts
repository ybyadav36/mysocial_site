"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { deleteUser, getCompanion, recordSwipe, resetPasses, unmatch } from "@/lib/data";
import { destroySession } from "@/lib/session";

export async function swipeAction(companionId: string, liked: boolean): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const companion = await getCompanion(companionId);
  if (!companion || !companion.isActive) return { ok: false };
  await recordSwipe(user.id, companion, liked);
  revalidatePath("/matches");
  return { ok: true };
}

export async function likeFromProfileAction(companionId: string): Promise<void> {
  const user = await requireUser();
  const companion = await getCompanion(companionId);
  if (!companion || !companion.isActive) redirect("/discover");
  await recordSwipe(user.id, companion, true);
  redirect(`/chat/${companionId}`);
}

export async function resetPassesAction(): Promise<void> {
  const user = await requireUser();
  await resetPasses(user.id);
  revalidatePath("/discover");
}

export async function unmatchAction(companionId: string): Promise<void> {
  const user = await requireUser();
  await unmatch(user.id, companionId);
  revalidatePath("/matches");
  redirect("/matches");
}

export async function deleteAccountAction(): Promise<void> {
  const user = await requireUser();
  await deleteUser(user.id);
  await destroySession();
  redirect("/");
}
