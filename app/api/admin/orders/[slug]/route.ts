import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { ORDER_STATUSES, updateOrder, type OrderStatus } from "@/lib/orders";

type Params = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "corps_invalide" }, { status: 400 });
  }
  const raw = body as Record<string, unknown>;

  const patch: { status?: OrderStatus; tracking?: string } = {};
  if ("status" in raw) {
    const status = String(raw.status);
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "statut_invalide" }, { status: 400 });
    }
    patch.status = status as OrderStatus;
  }
  if ("tracking" in raw) {
    patch.tracking = String(raw.tracking ?? "").trim().slice(0, 200);
  }

  const updated = await updateOrder(slug, patch);
  if (!updated) {
    return NextResponse.json({ error: "introuvable" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, order: updated });
}
