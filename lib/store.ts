import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * Dead-simple JSON-file persistence. One file per collection under `data/`.
 *
 * This is deliberately the ONLY module that knows where data lives: every read
 * and write in the app goes through `readCollection` / `writeCollection`, so
 * swapping the backing store for Postgres or Redis later is a change to this
 * file alone.
 *
 * Caveats, stated plainly:
 *  - It writes to the local filesystem, so it works in `next dev`/`next start`
 *    and on a single long-lived instance. It does NOT work on a read-only or
 *    multi-instance serverless deploy — move to a real database first.
 *  - Writes are serialized per-process by an in-memory promise chain and made
 *    atomic with a temp-file rename. Concurrent *processes* can still clobber
 *    each other; a single Node server is the supported shape.
 */
const DATA_DIR = join(process.cwd(), "data");

const writeChains = new Map<string, Promise<unknown>>();

function fileFor(collection: string): string {
  return join(DATA_DIR, `${collection}.json`);
}

export async function readCollection<T>(
  collection: string,
  fallback: T,
): Promise<T> {
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

export async function writeCollection<T>(
  collection: string,
  value: T,
): Promise<void> {
  const previous = writeChains.get(collection) ?? Promise.resolve();
  const next = previous.catch(() => {}).then(() => persist(collection, value));
  writeChains.set(collection, next);
  await next;
}

/**
 * Read, transform, and write a collection as one serialized step so two
 * near-simultaneous mutations can't lose each other's changes.
 */
export async function mutateCollection<T>(
  collection: string,
  fallback: T,
  mutate: (current: T) => T,
): Promise<T> {
  const previous = writeChains.get(collection) ?? Promise.resolve();
  const next = previous
    .catch(() => {})
    .then(async () => {
      const current = await readCollection(collection, fallback);
      const updated = mutate(current);
      await persist(collection, updated);
      return updated;
    });
  writeChains.set(collection, next);
  return next;
}
