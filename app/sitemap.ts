import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { siteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteOrigin();
  const now = new Date();

  const staticPaths = [
    "",
    "/collection",
    "/atelier",
    "/a-propos",
    "/suivi",
    "/livraison",
    "/retours",
    "/cgv",
    "/mentions-legales",
    "/confidentialite",
  ];

  const products = await getProducts().catch(() => []);

  return [
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/collection/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
