import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * JSON-file backend for the collection store. Used for local development (no
 * database needed) and any single long-lived Node instance. It does NOT work on
 * a read-only or multi-instance serverless filesystem — production uses the
 * Postgres backend (see lib/store.ts).
 *
 * Writes are serialized per-process by an in-memory promise chain and made
 * atomic with a temp-file rename.
 */
const DATA_DIR = join(process.cwd(), "data");

const writeChains = new Map<string, Promise<unknown>>();

function fileFor(collection: string): string {
  return join(DATA_DIR, `${collection}.json`);
}

export async function fileRead<T>(collection: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(fileFor(collection), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function persist<T>(collection: string, value: T): Promise<void> {
  const file = fileFor(collection);
  await mkdir(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(tmp, file);
}

export async function fileWrite<T>(collection: string, value: T): Promise<void> {
  const previous = writeChains.get(collection) ?? Promise.resolve();
  const next = previous.catch(() => {}).then(() => persist(collection, value));
  writeChains.set(collection, next);
  await next;
}

export async function fileMutate<T>(
  collection: string,
  fallback: T,
  mutate: (current: T) => T,
): Promise<T> {
  const previous = writeChains.get(collection) ?? Promise.resolve();
  const next = previous
    .catch(() => {})
    .then(async () => {
      const current = await fileRead(collection, fallback);
      const updated = mutate(current);
      await persist(collection, updated);
      return updated;
    });
  writeChains.set(collection, next);
  return next;
}
