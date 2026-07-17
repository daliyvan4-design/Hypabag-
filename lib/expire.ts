import "server-only";
import { getOrders, updateOrder } from "./orders";
import { releaseStock } from "./products";

/** Pending payments are held this long before their stock is released. */
export const PENDING_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Releases the stock held by payments that were started but never completed.
 * Genius Pay normally sends an expiry webhook, but this is the backstop for
 * abandoned checkouts so a piece isn't stuck "épuisé" indefinitely.
 *
 * Idempotent and safe to run often: it only touches orders still in
 * `en_attente_paiement` older than the TTL.
 */
export async function expireStalePendingOrders(
  maxAgeMs: number = PENDING_TTL_MS,
): Promise<number> {
  const now = Date.now();
  const stale = (await getOrders()).filter(
    (o) =>
      o.status === "en_attente_paiement" &&
      !o.paid &&
      now - new Date(o.createdAt).getTime() > maxAgeMs,
  );

  for (const order of stale) {
    // Release first; if that throws we don't mark it expired, so a retry fixes it.
    await releaseStock(order.lines.map((l) => ({ slug: l.slug, qte: l.qte })));
    await updateOrder(order.orderNo, { status: "paiement_echoue" });
  }

  return stale.length;
}
