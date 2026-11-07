import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  addMessage,
  deleteMessage,
  getCompanion,
  getConversation,
  isMatched,
  listMessages,
  setConversationMode,
} from "@/lib/data";
import { getUsage } from "@/lib/limits";
import { MODE_KEYS } from "@/lib/modes";
import { SOFT_DECLINE, describeAiError, finalText, streamCompanionReply } from "@/lib/ai";
import type { ChatStreamEvent } from "@/lib/chat-events";

export const maxDuration = 60;

const Body = z.object({
  message: z.string().trim().min(1).max(2000),
  mode: z.enum(MODE_KEYS as [string, ...string[]]),
});

function json(status: number, body: object) {
  return Response.json(body, { status });
}

export async function POST(req: Request, ctx: RouteContext<"/api/chat/[companionId]">) {
  const user = await getCurrentUser();
  if (!user) return json(401, { error: "Please log in again." });

  const { companionId } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json(400, { error: "Message must be 1–2000 characters." });
  const { message } = parsed.data;
  const mode = parsed.data.mode as (typeof MODE_KEYS)[number];

  const companion = await getCompanion(companionId);
  if (!companion || !companion.isActive) return json(404, { error: "This profile isn't available." });
  if (!(await isMatched(user.id, companionId))) return json(403, { error: "Match first to start chatting." });
  const conversation = await getConversation(user.id, companionId);
  if (!conversation) return json(403, { error: "Match first to start chatting." });

  const usage = await getUsage(user);
  if (usage.remaining === 0) {
    return json(429, {
      error: `You've used all ${usage.limit} free messages for today. Come back tomorrow!`,
      code: "daily_limit",
    });
  }

  if (conversation.mode !== mode) await setConversationMode(conversation.id, mode);
  const userMessageId = await addMessage(conversation.id, "user", message, mode);
  const history = await listMessages(conversation.id, 80);
  const remaining = usage.remaining === null ? null : usage.remaining - 1;

  const encoder = new TextEncoder();
  let clientGone = false;

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        if (clientGone) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          clientGone = true;
        }
      };

      send({ type: "start", userMessageId, remaining });
      try {
        const stream = streamCompanionReply({
          companion,
          userId: user.id,
          userName: user.name,
          mode,
          history,
        });
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send({ type: "delta", text: event.delta.text });
          }
        }
        const final = await stream.finalMessage();
        let reply = finalText(final);
        if (final.stop_reason === "refusal" || !reply) {
          // Declined (possibly after partial output): discard the partial text.
          reply = SOFT_DECLINE;
          send({ type: "replace", text: reply });
        }
        // Saved even if the user left the screen, so the reply is there when they come back.
        const messageId = await addMessage(conversation.id, "assistant", reply, mode);
        send({ type: "done", messageId });
      } catch (err) {
        console.error("chat reply failed", err);
        // Don't count a message that never got a reply against the daily limit.
        await deleteMessage(userMessageId).catch(() => {});
        send({ type: "error", message: describeAiError(err).message });
      } finally {
        if (!clientGone) controller.close();
      }
    },
    cancel() {
      clientGone = true;
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
