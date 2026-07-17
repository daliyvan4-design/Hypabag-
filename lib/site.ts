/** Public site origin, used for absolute URLs (sitemap, OG, email links). */
export function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hypa-one.vercel.app"
  ).replace(/\/$/, "");
}
