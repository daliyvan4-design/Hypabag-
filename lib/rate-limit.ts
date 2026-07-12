import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter for the public endpoints that can trigger email, a payment, or
 * an admin-password guess. Backed by Upstash Redis (sliding window, atomic,
 * shared across all instances) when configured; falls back to per-process
 * memory for local development.
 */
const WINDOW = "10 m";
const MAX_REQUESTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

/* Upstash backend ----------------------------------------------------------- */

let limiter: Ratelimit | null | undefined;

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    limiter = null;
    return null;
  }
  limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW),
    prefix: "hypa_rl",
    analytics: false,
  });
  return limiter;
}

/* In-memory fallback -------------------------------------------------------- */

const memory = new Map<string, number[]>();

function allowInMemory(key: string): boolean {
  const now = Date.now();
  const recent = (memory.get(key) ?? []).filter((at) => now - at < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    memory.set(key, recent);
    return false;
  }
  recent.push(now);
  memory.set(key, recent);

  if (memory.size > 1000) {
    for (const [entry, times] of memory) {
      if (times.every((at) => now - at >= WINDOW_MS)) memory.delete(entry);
    }
  }
  return true;
}

/* Public API ---------------------------------------------------------------- */

export async function allow(key: string): Promise<boolean> {
  const rl = getLimiter();
  if (!rl) return allowInMemory(key);
  try {
    const { success } = await rl.limit(key);
    return success;
  } catch (error) {
    // Never let the limiter's own failure lock users out; degrade to memory.
    console.error("rate-limit: upstash failed, using memory —", error);
    return allowInMemory(key);
  }
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
