import { NextResponse } from "next/server";
import {
  emailConfig,
  orderAlertHtml,
  orderConfirmationHtml,
  send,
  type OrderLine,
} from "@/lib/email";
import { formatEuro } from "@/lib/format";
import { recordOrder } from "@/lib/orders";
import { getProduct } from "@/lib/products";
import { allow, clientKey } from "@/lib/rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ORDER_NO = /^HY-\d{6}$/;
const MAX_LINES = 20;
const MAX_QTY = 99;

type Payload = {
  orderNo: string;
  email: string;
  prenom: string;
  nom: string;
  /** Only slug + quantity: prices are never taken from the client. */
  lines: { slug: string; qte: number }[];
};

function parse(body: unknown): Payload | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as Record<string, unknown>;

  const orderNo = String(raw.orderNo ?? "");
  const email = String(raw.email ?? "").trim();
  const prenom = String(raw.prenom ?? "").trim();
  const nom = String(raw.nom ?? "").trim();

  if (!ORDER_NO.test(orderNo)) return null;
  if (!EMAIL.test(email) || email.length > 254) return null;
  if (!prenom || prenom.length > 100 || !nom || nom.length > 100) return null;
  if (!Array.isArray(raw.lines) || raw.lines.length === 0) return null;
  if (raw.lines.length > MAX_LINES) return null;

  const lines: Payload["lines"] = [];
  for (const entry of raw.lines) {
    if (typeof entry !== "object" || entry === null) return null;
    const { slug, qte } = entry as { slug?: unknown; qte?: unknown };
    if (typeof slug !== "string" || !slug) return null;
    if (!Number.isInteger(qte) || (qte as number) < 1 || (qte as number) > MAX_QTY) {
      return null;
    }
    lines.push({ slug, qte: qte as number });
  }
  return { orderNo, email, prenom, nom, lines };
}

export async function POST(request: Request) {
  if (!allow(clientKey(request))) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const config = emailConfig();
  if (!config) {
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  const order = parse(await request.json().catch(() => null));
  if (!order) {
    return NextResponse.json({ error: "invalid_order" }, { status: 400 });
  }

  // Prices come from the catalogue, never from the request body. An unknown
  // slug fails the whole order rather than being silently priced at zero.
  let subtotal = 0;
  const emailLines: OrderLine[] = [];
  const recordLines: { slug: string; nom: string; qte: number; prix: number }[] = [];
  for (const { slug, qte } of order.lines) {
    const piece = await getProduct(slug);
    if (!piece) {
      return NextResponse.json({ error: "invalid_order" }, { status: 400 });
    }
    subtotal += piece.prix * qte;
    emailLines.push({ nom: piece.nom, qte, total: formatEuro(piece.prix * qte) });
    recordLines.push({ slug, nom: piece.nom, qte, prix: piece.prix });
  }
  const total = formatEuro(subtotal);

  const alert = await send(config, {
    to: config.shop,
    subject: `Nouvelle commande ${order.orderNo} — ${total}`,
    html: orderAlertHtml({ ...order, lines: emailLines, total }),
    replyTo: order.email,
  });
  if (!alert.ok) console.error("orders: shop alert failed —", alert.error);

  const customerEmailed =
    !config.sandbox &&
    (
      await send(config, {
        to: order.email,
        subject: `Votre commande HYPA ${order.orderNo}`,
        html: orderConfirmationHtml({
          orderNo: order.orderNo,
          prenom: order.prenom,
          lines: emailLines,
          total,
        }),
      }).then((result) => {
        if (!result.ok) console.error("orders: confirmation failed —", result.error);
        return result.ok;
      })
    );

  // Persist last so the dashboard only ever shows orders we actually processed.
  // Best-effort: on a read-only filesystem the write fails, but the emails are
  // already out — don't fail the customer's order over a dashboard record.
  try {
    await recordOrder({
      orderNo: order.orderNo,
      createdAt: new Date().toISOString(),
      email: order.email,
      prenom: order.prenom,
      nom: order.nom,
      lines: recordLines,
      total: subtotal,
      emailed: customerEmailed,
    });
  } catch (error) {
    console.error("orders: could not persist order —", error);
  }

  return NextResponse.json({
    ok: true,
    customerEmailed,
    ...(config.sandbox ? { reason: "sandbox" } : {}),
  });
}
