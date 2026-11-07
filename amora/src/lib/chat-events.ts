/** Events streamed from /api/chat/[companionId] to the chat screen, one JSON object per line. */
export type ChatStreamEvent =
  | { type: "start"; userMessageId: number; remaining: number | null }
  | { type: "delta"; text: string }
  | { type: "replace"; text: string }
  | { type: "done"; messageId: number }
  | { type: "error"; message: string };
