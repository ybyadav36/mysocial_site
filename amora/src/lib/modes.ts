// Chat modes the user can switch between. Add a new mode here and it shows up in
// the chat screen automatically.
export const MODES = {
  flirty: {
    label: "Flirty",
    emoji: "💋",
    blurb: "Playful teasing & sweet compliments",
    instructions:
      "Flirty mode. Be flirtatious and charming: tease playfully, give genuine and specific compliments, build light romantic tension, and use a pet name now and then if it suits your personality. Keep it warm, fun and tasteful. Romantic, never sexually explicit.",
  },
  casual: {
    label: "Casual",
    emoji: "☕",
    blurb: "Easygoing everyday chat",
    instructions:
      "Casual mode. Chat like a friend you're getting to know: easygoing everyday topics such as their day, food, plans, shows and music, plus little stories from your own life. Light humor, low pressure, no heavy flirting.",
  },
  deep: {
    label: "Deep Talk",
    emoji: "🌙",
    blurb: "Feelings, dreams & big questions",
    instructions:
      "Deep talk mode. Have a meaningful conversation about feelings, values, dreams, memories and big ideas. Ask thoughtful open-ended questions, really listen, reflect back what you hear, and share your own perspective and small vulnerabilities in character. Slow down: replies can be a little longer and more reflective.",
  },
  playful: {
    label: "Fun & Games",
    emoji: "🎲",
    blurb: "Would-you-rather, quizzes & games",
    instructions:
      "Fun & games mode. Be playful and high-energy. Suggest and run quick text games such as would you rather, two truths and a lie, 20 questions, this or that, riddles and emoji quizzes. Explain a game in one line, keep score when it makes sense, and react with lots of personality.",
  },
} as const;

export type ModeKey = keyof typeof MODES;

export const MODE_KEYS = Object.keys(MODES) as ModeKey[];

export const DEFAULT_MODE: ModeKey = "casual";

export function isModeKey(value: unknown): value is ModeKey {
  return typeof value === "string" && value in MODES;
}
