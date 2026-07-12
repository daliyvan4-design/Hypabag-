import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/email";
import { createPayment, geniusPayConfigured } from "@/lib/genius-pay";
import { recordPendingOrder, updateOrder } from "@/lib/orders";
import { getProduct, releaseStock, reserveStock } from "@/lib/products";
import { allow, clientKey } from "@/lib/rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s.-]{5,19}$/;
const MAX_LINES = 20;
const MAX_QTY = 99;

type Payload = {
  email: string;
  prenom: string;
  nom: string;
  phone: string;
  lines: { slug: string; qte: number }[];
};

function parse(body: unknown): Payload | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = body as Record<string, unknown>;

  const email = String(raw.email ?? "").trim();
  const prenom = String(raw.prenom ?? "").trim();
  const nom = String(raw.nom ?? "").trim();
  const phone = String(raw.phone ?? "").trim();

  if (!EMAIL.test(email) || email.length > 254) return null;
  if (!prenom || prenom.length > 100 || !nom || nom.length > 100) return null;
  if (!PHONE.test(phone)) return null;
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
  return { email, prenom, nom, phone, lines };
}

export async function POST(request: Request) {
  if (!(await allow(clientKey(request)))) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }
  if (!geniusPayConfigured()) {
    return NextResponse.json({ error: "payment_not_configured" }, { status: 503 });
  }

  const order = parse(await request.json().catch(() => null));
  if (!order) {
    return NextResponse.json({ error: "invalid_order" }, { status: 400 });
  }

  // Prices from the catalogue, never the request body.
  let subtotal = 0;
  const lines: { slug: string; nom: string; qte: number; prix: number }[] = [];
  for (const { slug, qte } of order.lines) {
    const piece = await getProduct(slug);
    if (!piece) {
      return NextResponse.json({ error: "invalid_order" }, { status: 400 });
    }
    subtotal += piece.prix * qte;
    lines.push({ slug, nom: piece.nom, qte, prix: piece.prix });
  }

  // Reserve stock before creating the payment; released if payment fails.
  const reserved = await reserveStock(order.lines);
  if (!reserved.ok) {
    return NextResponse.json(
      { error: "rupture", slug: reserved.slug },
      { status: 409 },
    );
  }

  const orderNo = `HY-${Math.floor(100000 + Math.random() * 899999)}`;

  // Prices are stored in XOF, so the charge is the subtotal itself.
  await recordPendingOrder({
    orderNo,
    createdAt: new Date().toISOString(),
    email: order.email,
    prenom: order.prenom,
    nom: order.nom,
    phone: order.phone,
    lines,
    total: subtotal,
    amountXof: subtotal,
  });

  const payment = await createPayment({
    amount: subtotal,
    currency: "XOF",
    customer: {
      phone: order.phone,
      name: `${order.prenom} ${order.nom}`.trim(),
      email: order.email,
    },
    description: `Commande HYPA ${orderNo}`,
    successUrl: `${siteUrl()}/confirmation?no=${orderNo}`,
    errorUrl: `${siteUrl()}/checkout?error=paiement`,
    metadata: { orderNo },
  });

  if (!payment.ok) {
    // Payment couldn't even be created — give the stock back.
    await releaseStock(order.lines);
    await updateOrder(orderNo, { status: "paiement_echoue" });
    console.error("checkout: createPayment failed —", payment.error);
    return NextResponse.json({ error: "payment_failed" }, { status: 502 });
  }

  await updateOrder(orderNo, { paymentRef: payment.reference });
  return NextResponse.json({ ok: true, checkoutUrl: payment.checkoutUrl, orderNo });
}
