import "server-only";
import { createHash } from "node:crypto";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;

export function cloudinaryConfigured(): boolean {
  return Boolean(CLOUD && KEY && SECRET);
}

/** Cloudinary signs the alphabetically-sorted params, then the api_secret. */
function sign(params: Record<string, string | number>): string {
  const payload = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1")
    .update(payload + SECRET)
    .digest("hex");
}

export type Upload = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
};

export type UploadResult =
  | { ok: true; upload: Upload }
  | { ok: false; error: string };

/**
 * Signed server-side upload. `kind` picks the Cloudinary endpoint; `folder`
 * keeps assets tidy (e.g. "hypa/products", "hypa/site").
 */
export async function uploadToCloudinary(
  file: File,
  kind: "image" | "video",
  folder: string,
): Promise<UploadResult> {
  if (!cloudinaryConfigured()) {
    return { ok: false, error: "cloudinary_not_configured" };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signed = { folder, timestamp };
  const form = new FormData();
  form.set("file", file);
  form.set("api_key", KEY as string);
  form.set("timestamp", String(timestamp));
  form.set("folder", folder);
  form.set("signature", sign(signed));

  let response: Response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD}/${kind}/upload`,
      { method: "POST", body: form },
    );
  } catch (cause) {
    return { ok: false, error: `cloudinary_unreachable: ${String(cause)}` };
  }

  const body: Record<string, unknown> = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const detail =
      (body.error as { message?: string } | undefined)?.message ??
      `HTTP ${response.status}`;
    return { ok: false, error: detail };
  }

  return {
    ok: true,
    upload: {
      url: String(body.secure_url),
      publicId: String(body.public_id),
      resourceType: kind,
      format: String(body.format ?? ""),
      bytes: Number(body.bytes ?? 0),
      width: body.width ? Number(body.width) : undefined,
      height: body.height ? Number(body.height) : undefined,
      duration: body.duration ? Number(body.duration) : undefined,
    },
  };
}
