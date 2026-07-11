import "server-only";
import { Pool } from "pg";

/**
 * Postgres connection, shared across the process. On Vercel the Neon
 * integration injects POSTGRES_URL (pooled) and DATABASE_URL; we prefer the
 * pooled one so Fluid Compute instances don't exhaust connections.
 */
const CONNECTION_STRING =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

export function hasPostgres(): boolean {
  return CONNECTION_STRING.length > 0;
}

function localHost(url: string): boolean {
  return /@(localhost|127\.0\.0\.1)[:/]/.test(url);
}

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: CONNECTION_STRING,
      // Small ceiling: instances are reused, and Neon's pooler fans out.
      max: 3,
      idleTimeoutMillis: 30_000,
      // Managed Postgres uses SSL with chains node won't validate out of the
      // box; local test clusters use none.
      ssl: localHost(CONNECTION_STRING) ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}
