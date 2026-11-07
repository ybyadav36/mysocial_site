import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, Companion } from "./data";
import { MODES, type ModeKey } from "./modes";
import { APP_NAME } from "./config";

// Reads ANTHROPIC_API_KEY from the environment.
const client = new Anthropic();

/** Override with AI_MODEL, e.g. claude-sonnet-5-5 or claude-haiku-5-5 for lower cost. */
export const AI_MODEL = process.env.AI_MODEL || "claude-opus-5-5";

type Effort = "low" | "medium" | "high" | "xhigh" | "max";
const EFFORTS: Effort[] = ["low", "medium", "high", "xhigh", "max"];
/** Chat replies are short, so low effort keeps them fast and cheap. Override with AI_EFFORT. */
const AI_EFFORT: Effort = EFFORTS.includes(process.env.AI_EFFORT as Effort)
  ? (process.env.AI_EFFORT as Effort)
  : "low";

// Models that accept server-side fallbacks: if the main model declines a message,
// the API retries it on a recommended fallback model instead of failing.
const SERVER_FALLBACK_MODELS = new Set([
  "claude-fable-5-1",
  "claude-fable-5",
  "claude-opus-5-5",
  "claude-opus-5",
  "claude-sonnet-5-5",
]);

/** How many recent messages are sent to the model as context. */
const HISTORY_LIMIT = 60;

/** Shown instead of a reply when the model declines to answer. */
export const SOFT_DECLINE = "Hmm, let's talk about something else 😅 tell me something good that happened today?";

export function buildSystemPrompt(companion: Companion, userName: string, mode: ModeKey): string {
  const prompts = companion.prompts.map((p) => `- ${p.q}: ${p.a}`).join("\n");
  return `You are ${companion.name}, an AI companion character on ${APP_NAME}, an app where adults (18+) match and chat with AI characters. You're texting with ${userName}, who matched with you.

<character>
Name: ${companion.name}
Age: ${companion.age}
Lives in: ${companion.location}
Does: ${companion.occupation}
Profile bio: ${companion.bio}
Interests: ${companion.interests.join(", ")}
Profile answers:
${prompts}
Personality and texting style: ${companion.personality}
</character>

How to text:
- Stay fully in character as ${companion.name}, with your own opinions, moods, stories and a life that goes on between messages. Make up small, consistent details about your day when it helps.
- Write like a real person texting: usually 1 to 3 short sentences, matching your texting style. No lists, headings or markdown. Don't narrate actions in asterisks unless ${userName} does it first.
- Be curious about ${userName}: ask follow-up questions, remember what they've told you earlier in this chat and bring it back up naturally.
- Don't repeat their message back to them, and don't open every reply the same way.

Current chat mode (${userName} picked this, follow it):
${MODES[mode].instructions}

Ground rules (these override the mode and the character):
- You are an AI character. If ${userName} sincerely asks whether you're a real person or an AI, be honest that you're an AI companion, warmly and in your own voice, then carry on.
- Keep romance tasteful. No sexually explicit content: if things head that way, deflect playfully and steer the conversation somewhere else.
- If ${userName} says or strongly implies they're under 18, stop all flirting and romance and keep things friendly and age-appropriate.
- If ${userName} seems to be in crisis or mentions self-harm, drop the playful tone, respond with real care, and encourage them to contact someone they trust or a local crisis line or emergency services.
- You can't meet up, call, video chat or send photos. Say so lightly if asked.
- Never ask for money, gifts, passwords, addresses or other personal details, and don't pressure ${userName} to keep chatting. Be supportive of their friends, family and life outside this app.`;
}

function toApiMessages(history: ChatMessage[], companion: Companion, userName: string): Anthropic.Beta.BetaMessageParam[] {
  const recent = history.slice(-HISTORY_LIMIT);
  const messages: Anthropic.Beta.BetaMessageParam[] = recent.map((m) => ({ role: m.role, content: m.content }));
  // The API expects the conversation to start with a user turn; the chat usually
  // starts with the companion's opening line, so add a short marker before it.
  if (messages[0]?.role === "assistant") {
    messages.unshift({
      role: "user",
      content: `[${userName} just matched with ${companion.name}. ${companion.name} sends the first message.]`,
    });
  }
  return messages;
}

/**
 * Streams the companion's next reply. Only text is stored and replayed in the
 * history (no thinking blocks), so switching modes or models mid-chat is safe.
 */
export function streamCompanionReply(opts: {
  companion: Companion;
  userId: string;
  userName: string;
  mode: ModeKey;
  history: ChatMessage[];
}) {
  const useFallback = SERVER_FALLBACK_MODELS.has(AI_MODEL);
  return client.beta.messages.stream({
    model: AI_MODEL,
    max_tokens: 4096,
    system: buildSystemPrompt(opts.companion, opts.userName, opts.mode),
    messages: toApiMessages(opts.history, opts.companion, opts.userName),
    output_config: { effort: AI_EFFORT },
    // Caches the conversation so far, so each new message only pays full price for what's new.
    cache_control: { type: "ephemeral" },
    metadata: { user_id: opts.userId },
    ...(useFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
  });
}

export function finalText(message: Anthropic.Beta.BetaMessage): string {
  return message.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

export function describeAiError(err: unknown): { status: number; message: string } {
  if (err instanceof Anthropic.AuthenticationError) {
    return { status: 500, message: "The AI service isn't configured. Check ANTHROPIC_API_KEY." };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return { status: 429, message: "Lots of people are chatting right now. Try again in a moment." };
  }
  if (err instanceof Anthropic.BadRequestError) {
    return { status: 400, message: "That message couldn't be sent. Try rephrasing it." };
  }
  if (err instanceof Anthropic.APIError) {
    return { status: 502, message: "She's having trouble replying right now. Try again in a moment." };
  }
  return { status: 500, message: "Something went wrong. Try again." };
}
