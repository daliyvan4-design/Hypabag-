import "server-only";

/**
 * Best-effort throttle for the two public endpoints that can make Resend send
 * mail. It lives in the function instance's memory, so it is defeated by a
 * cold start or by spreading requests across regions — it raises the cost of
 * casual abuse, it does not prevent it. Move to a shared store (Upstash Redis,
 * Vercel KV) before this site takes real traffic.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

const hits = new Map<string, number[]>();

export function allow(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic sweep so an idle instance doesn't hold every IP it ever saw.
  if (hits.size > 1000) {
    for (const [entry, times] of hits) {
      if (times.every((at) => now - at >= WINDOW_MS)) hits.delete(entry);
    }
  }
  return true;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
