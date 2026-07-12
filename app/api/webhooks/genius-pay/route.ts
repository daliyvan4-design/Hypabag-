import { NextResponse } from "next/server";
import {
  emailConfig,
  orderAlertHtml,
  orderConfirmationHtml,
  send,
  type OrderLine,
} from "@/lib/email";
import { formatXof } from "@/lib/format";
import { verifyWebhook } from "@/lib/genius-pay";
import { getOrder, updateOrder } from "@/lib/orders";
import { releaseStock } from "@/lib/products";

/** Genius Pay posts JSON; we must hash the raw body, so read it as text. */
export async function POST(request: Request) {
  const raw = await request.text();
  const payload = verifyWebhook(
    raw,
    request.headers.get("x-webhook-signature"),
    request.headers.get("x-webhook-timestamp"),
  );

  if (!payload) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const orderNo = payload.data.metadata?.orderNo;
  if (!orderNo) {
    // Nothing we can reconcile; acknowledge so Genius Pay stops retrying.
    return NextResponse.json({ ok: true, ignored: "no_order" });
  }

  const order = await getOrder(orderNo);
  if (!order) {
    return NextResponse.json({ ok: true, ignored: "unknown_order" });
  }

  switch (payload.event) {
    case "payment.success":
      await fulfill(orderNo);
      break;
    case "payment.failed":
    case "payment.cancelled":
    case "payment.expired":
      // Only the first terminal event releases stock, and never for a paid order.
      if (!order.paid && order.status !== "paiement_echoue") {
        await releaseStock(
          order.lines.map((l) => ({ slug: l.slug, qte: l.qte })),
        );
        await updateOrder(orderNo, { status: "paiement_echoue" });
      }
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}

async function fulfill(orderNo: string): Promise<void> {
  const order = await getOrder(orderNo);
  if (!order || order.paid) return; // idempotent: webhooks can be retried

  await updateOrder(orderNo, { paid: true, status: "en_preparation" });

  const config = emailConfig();
  if (!config) return;

  const emailLines: OrderLine[] = order.lines.map((l) => ({
    nom: l.nom,
    qte: l.qte,
    total: formatXof(l.prix * l.qte),
  }));
  const total = formatXof(order.total);

  await send(config, {
    to: config.shop,
    subject: `Nouvelle commande ${order.orderNo} — ${total}`,
    html: orderAlertHtml({
      orderNo: order.orderNo,
      prenom: order.prenom,
      nom: order.nom,
      email: order.email,
      lines: emailLines,
      total,
    }),
    replyTo: order.email,
  }).then((r) => {
    if (!r.ok) console.error("webhook: shop alert failed —", r.error);
  });

  if (config.sandbox) return;

  const confirmation = await send(config, {
    to: order.email,
    subject: `Votre commande HYPA ${order.orderNo}`,
    html: orderConfirmationHtml({
      orderNo: order.orderNo,
      prenom: order.prenom,
      email: order.email,
      lines: emailLines,
      total,
    }),
  });
  await updateOrder(orderNo, { emailed: confirmation.ok });
  if (!confirmation.ok) {
    console.error("webhook: confirmation email failed —", confirmation.error);
  }
}
