/**
 * Uploads the seed assets in public/assets to Cloudinary (folder `hypa/`).
 *
 *   pnpm media:upload
 *
 * This is only for the images bundled with the repo (logo, cordon still). The
 * hero and loader videos are uploaded from the backoffice at runtime, and which
 * video is active is stored in data/site.json — not here.
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const ASSETS_DIR = join(process.cwd(), "public", "assets");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

/** Cloudinary signs the alphabetically-sorted params, then the api_secret. */
function sign(params, secret) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(payload + secret).digest("hex");
}

async function upload() {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud || !key || !secret) {
    console.error(
      "media: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and " +
        "CLOUDINARY_API_SECRET (they live in .env.local).",
    );
    process.exit(1);
  }

  const files = (await readdir(ASSETS_DIR)).filter((f) =>
    IMAGE_EXT.has(extname(f).toLowerCase()),
  );
  if (files.length === 0) {
    console.error(`media: no images in ${ASSETS_DIR}`);
    process.exit(1);
  }

  for (const file of files.sort()) {
    const publicId = `hypa/${basename(file, extname(file))}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const signed = { public_id: publicId, timestamp, overwrite: "true", invalidate: "true" };

    const form = new FormData();
    const bytes = await readFile(join(ASSETS_DIR, file));
    form.set("file", new Blob([bytes]), file);
    form.set("api_key", key);
    form.set("signature", sign(signed, secret));
    for (const [k, v] of Object.entries(signed)) form.set(k, String(v));

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
      { method: "POST", body: form },
    );
    const body = await res.json();
    if (!res.ok) {
      console.error(`media: FAILED ${file} — ${body?.error?.message ?? res.status}`);
      process.exit(1);
    }
    console.log(`media: uploaded ${file} -> ${body.public_id} (${(body.bytes / 1024).toFixed(0)} KB)`);
  }
}

await upload();
