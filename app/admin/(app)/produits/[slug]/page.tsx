import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { ProductForm } from "../product-form";
import admin from "../../../admin.module.css";

type Params = { params: Promise<{ slug: string }> };

export default async function EditProduct({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <div className={admin.header}>
        <div>
          <h1 className={admin.title}>{product.nom}</h1>
          <p className={admin.subtitle}>
            <Link href={`/collection/${product.slug}`} target="_blank" style={{ color: "var(--bordeaux)" }}>
              Voir sur le site ↗
            </Link>
          </p>
        </div>
      </div>
      <ProductForm product={product} />
    </>
  );
}
