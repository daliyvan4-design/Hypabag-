import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { cloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";
import { updateSiteSettings } from "@/lib/site-settings";

const MAX_IMAGE = 12 * 1024 * 1024; // 12 MB
const MAX_VIDEO = 100 * 1024 * 1024; // 100 MB

/**
 * Uploads one file to Cloudinary. The `slot` form field decides where it lands
 * and whether it also becomes an active site video:
 *   - "product" -> hypa/products, returns the URL for a product photo
 *   - "hero"    -> hypa/site, and set as the hero background video
 *   - "loader"  -> hypa/site, and set as the transition-curtain video
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      { error: "cloudinary_not_configured" },
      { status: 503 },
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const slot = String(form?.get("slot") ?? "product");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "fichier_manquant" }, { status: 400 });
  }

  const isVideo = slot === "hero" || slot === "loader";
  const kind = isVideo ? "video" : "image";
  const limit = isVideo ? MAX_VIDEO : MAX_IMAGE;

  if (file.size > limit) {
    return NextResponse.json({ error: "fichier_trop_lourd" }, { status: 413 });
  }
  if (isVideo && !file.type.startsWith("video/")) {
    return NextResponse.json({ error: "video_attendue" }, { status: 400 });
  }
  if (!isVideo && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "image_attendue" }, { status: 400 });
  }

  const folder = isVideo ? "hypa/site" : "hypa/products";
  const result = await uploadToCloudinary(file, kind, folder);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  if (slot === "hero") {
    await updateSiteSettings({ heroVideo: result.upload.url });
    revalidatePath("/");
  } else if (slot === "loader") {
    await updateSiteSettings({ loaderVideo: result.upload.url });
    revalidatePath("/", "layout");
  }

  return NextResponse.json({ ok: true, upload: result.upload });
}
