/**
 * Client-safe media constants. Anything that varies at runtime (the hero and
 * loader videos, set from the backoffice) lives in the JSON store and is read
 * server-side via `lib/site-settings.ts`, then passed down as props — so this
 * module stays importable from client components.
 */

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/** Served through next/image, i.e. routed via lib/cloudinary-loader. */
export const HERO_POSTER = "/assets/cordon-macro.jpg";
export const LOGO_MARK = "/assets/hypa-logo-mark.jpg";
/** The "Hypa" wordmark on white — designed to sit on ecru via mix-blend multiply. */
export const LOGO_FULL = "/assets/hypa-logo-full.jpg";

/**
 * The base design's page-transition animation: the "Hypa" logo rotating in 3D
 * on white, dropped onto the ecru screen via mix-blend multiply. Served
 * optimised from Cloudinary when configured, else from public/assets. A video
 * uploaded via the backoffice (site.loaderVideo) still overrides this.
 */
export const LOADER_VIDEO_DEFAULT = CLOUD
  ? `https://res.cloudinary.com/${CLOUD}/video/upload/q_auto/hypa/loading.mp4`
  : "/assets/loading.mp4";
