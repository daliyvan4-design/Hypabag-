import "server-only";
import { getPool } from "./db";

/**
 * Postgres backend for the collection store: one JSONB row per collection in a
 * `store(key, value)` table. Keeping each collection as a single document means
 * the rest of the app (products, orders, subscribers, settings) is unchanged —
 * it still reads and writes whole collections.
 */

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS store (
           key text PRIMARY KEY,
           value jsonb NOT NULL,
           updated_at timestamptz NOT NULL DEFAULT now()
         )`,
      )
      .then(() => undefined)
      .catch((error) => {
        // Let the next call retry rather than caching the failure forever.
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}

const UPSERT = `INSERT INTO store (key, value) VALUES ($1, $2::jsonb)
   ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = now()`;

export async function pgRead<T>(key: string, fallback: T): Promise<T> {
  await ensureSchema();
  const result = await getPool().query<{ value: T }>(
    "SELECT value FROM store WHERE key = $1",
    [key],
  );
  return result.rows.length ? result.rows[0].value : fallback;
}

export async function pgWrite<T>(key: string, value: T): Promise<void> {
  await ensureSchema();
  await getPool().query(UPSERT, [key, JSON.stringify(value)]);
}

/** Read-modify-write under a row lock so concurrent mutations can't clobber. */
export async function pgMutate<T>(
  key: string,
  fallback: T,
  mutate: (current: T) => T,
): Promise<T> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<{ value: T }>(
      "SELECT value FROM store WHERE key = $1 FOR UPDATE",
      [key],
    );
    const current = result.rows.length ? result.rows[0].value : fallback;
    const updated = mutate(current);
    await client.query(UPSERT, [key, JSON.stringify(updated)]);
    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
