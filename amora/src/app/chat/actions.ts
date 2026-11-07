"use server";

import { requireUser } from "@/lib/auth";
import { getConversation, setConversationMode } from "@/lib/data";
import { isModeKey } from "@/lib/modes";

export async function setModeAction(companionId: string, mode: string): Promise<void> {
  const user = await requireUser();
  if (!isModeKey(mode)) return;
  const conversation = await getConversation(user.id, companionId);
  if (conversation && conversation.mode !== mode) await setConversationMode(conversation.id, mode);
}
