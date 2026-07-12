import { NextResponse } from "next/server";
import { findOrder } from "@/lib/orders";
import { allow, clientKey } from "@/lib/rate-limit";

const ORDER_NO = /^HY-\d{6}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Public order tracking. Returns an order only when the email matches the one
 * on file, so a bare order number can't be enumerated. */
export async function POST(request: Request) {
  if (!(await allow(`lookup:${clientKey(request)}`))) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const body: unknown = await request.json().catch(() => null);
  const raw = (body ?? {}) as Record<string, unknown>;
  const orderNo = String(raw.orderNo ?? "").trim().toUpperCase();
  const email = String(raw.email ?? "").trim();

  if (!ORDER_NO.test(orderNo) || !EMAIL.test(email)) {
    return NextResponse.json({ error: "invalide" }, { status: 400 });
  }

  const order = await findOrder(orderNo, email);
  if (!order) {
    // Same response whether the order is missing or the email is wrong.
    return NextResponse.json({ error: "introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    order: {
      orderNo: order.orderNo,
      status: order.status,
      tracking: order.tracking ?? null,
      createdAt: order.createdAt,
      lines: order.lines.map((l) => ({ nom: l.nom, qte: l.qte })),
    },
  });
}
