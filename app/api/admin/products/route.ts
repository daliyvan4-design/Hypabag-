import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { parseProductInput } from "@/lib/admin-product-input";
import { createProduct, getProducts } from "@/lib/products";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ products: await getProducts() });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = parseProductInput(await request.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await createProduct(parsed.input);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidateStorefront(result.product.slug);
  return NextResponse.json({ ok: true, product: result.product }, { status: 201 });
}

export function revalidateStorefront(slug?: string) {
  revalidatePath("/");
  revalidatePath("/collection");
  if (slug) revalidatePath(`/collection/${slug}`);
}
