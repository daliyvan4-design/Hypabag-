import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { parseProductInput } from "@/lib/admin-product-input";
import { deleteProduct, updateProduct } from "@/lib/products";
import { revalidateStorefront } from "../route";

type Params = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const parsed = parseProductInput(await request.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await updateProduct(slug, parsed.input);
  if (!result.ok) {
    const status = result.error === "introuvable" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  revalidateStorefront(slug);
  return NextResponse.json({ ok: true, product: result.product });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const removed = await deleteProduct(slug);
  if (!removed) {
    return NextResponse.json({ error: "introuvable" }, { status: 404 });
  }

  revalidateStorefront(slug);
  return NextResponse.json({ ok: true });
}
