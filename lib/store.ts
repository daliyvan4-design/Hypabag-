import "server-only";
import { hasPostgres } from "./db";
import { fileMutate, fileRead, fileWrite } from "./store-file";
import { pgMutate, pgRead, pgWrite } from "./store-postgres";

/**
 * The single seam between the app and its persistence. Everything reads and
 * writes whole "collections" (products, orders, subscribers, site) through
 * these three functions; the backend is chosen once, here:
 *
 *   - a connection string set (POSTGRES_URL / DATABASE_URL) → Postgres,
 *   - otherwise → JSON files under data/ (local development).
 *
 * Swapping or adding a backend is a change to this file alone.
 */

export function readCollection<T>(collection: string, fallback: T): Promise<T> {
  return hasPostgres()
    ? pgRead(collection, fallback)
    : fileRead(collection, fallback);
}

export function writeCollection<T>(collection: string, value: T): Promise<void> {
  return hasPostgres()
    ? pgWrite(collection, value)
    : fileWrite(collection, value);
}

export function mutateCollection<T>(
  collection: string,
  fallback: T,
  mutate: (current: T) => T,
): Promise<T> {
  return hasPostgres()
    ? pgMutate(collection, fallback, mutate)
    : fileMutate(collection, fallback, mutate);
}
