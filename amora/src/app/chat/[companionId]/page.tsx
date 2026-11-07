import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChatView } from "@/components/ChatView";
import { requireUser } from "@/lib/auth";
import { getCompanion, getConversation, listMessages, toPublicCompanion } from "@/lib/data";
import { getUsage } from "@/lib/limits";

export async function generateMetadata(props: PageProps<"/chat/[companionId]">): Promise<Metadata> {
  const { companionId } = await props.params;
  const c = await getCompanion(companionId);
  return { title: c ? `Chat with ${c.name}` : "Chat" };
}

export default async function ChatPage(props: PageProps<"/chat/[companionId]">) {
  const { companionId } = await props.params;
  const user = await requireUser();
  const companion = await getCompanion(companionId);
  if (!companion || !companion.isActive) redirect("/matches");
  const conversation = await getConversation(user.id, companion.id);
  if (!conversation) redirect(`/companions/${companion.id}`);

  const [messages, usage] = await Promise.all([listMessages(conversation.id), getUsage(user)]);

  return (
    <ChatView
      companion={toPublicCompanion(companion)}
      initialMode={conversation.mode}
      initialMessages={messages.map((m) => ({ id: m.id, role: m.role, content: m.content, mode: m.mode }))}
      initialRemaining={usage.remaining}
      dailyLimit={usage.limit}
    />
  );
}
