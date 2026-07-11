import "server-only";
import { mutateCollection, readCollection } from "./store";

export type Subscriber = {
  email: string;
  createdAt: string;
};

const COLLECTION = "subscribers";

/** Adds an email if it isn't already subscribed. Returns true if it was new. */
export async function addSubscriber(email: string): Promise<boolean> {
  const normalised = email.trim().toLowerCase();
  let added = false;
  await mutateCollection<Subscriber[]>(COLLECTION, [], (current) => {
    if (current.some((s) => s.email === normalised)) return current;
    added = true;
    return [{ email: normalised, createdAt: new Date().toISOString() }, ...current];
  });
  return added;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  return readCollection<Subscriber[]>(COLLECTION, []);
}
