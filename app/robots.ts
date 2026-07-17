import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the backoffice and private/transactional routes out of the index.
      disallow: ["/admin", "/api/", "/checkout", "/confirmation", "/panier"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
