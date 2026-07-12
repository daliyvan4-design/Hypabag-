import "server-only";
import { getPool, hasPostgres } from "./db";

/**
 * Fixed-window rate limiter for the public endpoints that can trigger email or
 * guess the admin password. Shared across instances via Postgres when a
 * database is configured (so it actually holds under real traffic); falls back
 * to per-process memory for local development.
 */
const WINDOW_SECONDS = 10 * 60;
const MAX_REQUESTS = 5;

/* In-memory fallback -------------------------------------------------------- */

const memory = new Map<string, number[]>();

function allowInMemory(key: string): boolean {
  const now = Date.now();
  const windowMs = WINDOW_SECONDS * 1000;
  const recent = (memory.get(key) ?? []).filter((at) => now - at < windowMs);

  if (recent.length >= MAX_REQUESTS) {
    memory.set(key, recent);
    return false;
  }
  recent.push(now);
  memory.set(key, recent);

  if (memory.size > 1000) {
    for (const [entry, times] of memory) {
      if (times.every((at) => now - at >= windowMs)) memory.delete(entry);
    }
  }
  return true;
}

/* Postgres backend ---------------------------------------------------------- */

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS rate_limit (
           key text PRIMARY KEY,
           window_start timestamptz NOT NULL,
           count int NOT NULL
         )`,
      )
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}

async function allowInPostgres(key: string): Promise<boolean> {
  await ensureSchema();
  // Upsert that resets the window once it has elapsed, otherwise increments.
  const result = await getPool().query<{ count: number }>(
    `INSERT INTO rate_limit (key, window_start, count) VALUES ($1, now(), 1)
     ON CONFLICT (key) DO UPDATE SET
       window_start = CASE
         WHEN rate_limit.window_start < now() - ($2 * interval '1 second')
         THEN now() ELSE rate_limit.window_start END,
       count = CASE
         WHEN rate_limit.window_start < now() - ($2 * interval '1 second')
         THEN 1 ELSE rate_limit.count + 1 END
     RETURNING count`,
    [key, WINDOW_SECONDS],
  );
  return (result.rows[0]?.count ?? 1) <= MAX_REQUESTS;
}

/* Public API ---------------------------------------------------------------- */

export async function allow(key: string): Promise<boolean> {
  if (!hasPostgres()) return allowInMemory(key);
  try {
    return await allowInPostgres(key);
  } catch (error) {
    // Never let the limiter's own failure lock users out; degrade to memory.
    console.error("rate-limit: postgres failed, using memory —", error);
    return allowInMemory(key);
  }
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
