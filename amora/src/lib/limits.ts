import "server-only";
import { countUserMessagesToday, type User } from "./data";

/**
 * Daily free-message allowance. Set FREE_DAILY_MESSAGE_LIMIT in your environment
 * (e.g. 30). Leave it empty or 0 for unlimited. Users with plan = 'premium' are
 * never limited.
 */
export function dailyLimitFor(user: Pick<User, "plan">): number | null {
  if (user.plan === "premium") return null;
  const limit = Number.parseInt(process.env.FREE_DAILY_MESSAGE_LIMIT ?? "", 10);
  return Number.isFinite(limit) && limit > 0 ? limit : null;
}

export type Usage = { used: number; limit: number | null; remaining: number | null };

export async function getUsage(user: Pick<User, "id" | "plan">): Promise<Usage> {
  const limit = dailyLimitFor(user);
  const used = await countUserMessagesToday(user.id);
  return { used, limit, remaining: limit === null ? null : Math.max(0, limit - used) };
}
