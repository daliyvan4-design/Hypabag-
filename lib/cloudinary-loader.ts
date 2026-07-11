/**
 * next/image loader. Wired up in next.config.ts, so it runs for every <Image>.
 *
 * Two shapes reach it:
 *  - `/assets/foo.jpg` — a bundled seed asset. With a cloud name configured it
 *    maps to the `hypa/foo` public id (uploaded by `pnpm media:upload`);
 *    without one, it is served straight from public/ so local dev needs no
 *    credentials.
 *  - a full `res.cloudinary.com/<cloud>/image/upload/...` URL — an admin-
 *    uploaded product photo. We inject `f_auto,q_auto,w_<width>` right after
 *    `/upload/` so responsive sizing and format negotiation still apply.
 *
 * Anything else is handed back untouched.
 */
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const LOCAL_PREFIX = "/assets/";

function transform(width: number, quality?: number): string {
  return ["f_auto", quality ? `q_${quality}` : "q_auto", `w_${width}`, "c_limit"].join(
    ",",
  );
}

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!CLOUD) return src;

  const uploadMarker = `res.cloudinary.com/${CLOUD}/image/upload/`;
  const markerAt = src.indexOf(uploadMarker);
  if (markerAt !== -1) {
    const head = src.slice(0, markerAt + uploadMarker.length);
    const tail = src.slice(markerAt + uploadMarker.length);
    // Don't double-stack transforms if the URL already carries one.
    if (/^(f_|q_|w_|c_)/.test(tail)) return src;
    return `${head}${transform(width, quality)}/${tail}`;
  }

  if (src.startsWith(LOCAL_PREFIX)) {
    const publicId = `hypa/${src.slice(LOCAL_PREFIX.length).replace(/\.[^.]+$/, "")}`;
    return `https://res.cloudinary.com/${CLOUD}/image/upload/${transform(width, quality)}/${publicId}`;
  }

  return src;
}
