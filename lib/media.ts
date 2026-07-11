/**
 * Client-safe media constants. Anything that varies at runtime (the hero and
 * loader videos, set from the backoffice) lives in the JSON store and is read
 * server-side via `lib/site-settings.ts`, then passed down as props — so this
 * module stays importable from client components.
 */

/** Served through next/image, i.e. routed via lib/cloudinary-loader. */
export const HERO_POSTER = "/assets/cordon-macro.jpg";
export const LOGO_MARK = "/assets/hypa-logo-mark.jpg";
/** The "Hypa" wordmark on white — designed to sit on ecru via mix-blend multiply. */
export const LOGO_FULL = "/assets/hypa-logo-full.jpg";
