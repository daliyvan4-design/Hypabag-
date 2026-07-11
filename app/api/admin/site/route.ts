import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { updateSiteSettings, type SiteSettings } from "@/lib/site-settings";

/** Clears or overrides the active hero / loader video (e.g. "revert to still"). */
export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "corps_invalide" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const patch: Partial<SiteSettings> = {};
  for (const key of ["heroVideo", "loaderVideo"] as const) {
    if (key in raw) {
      const value = raw[key];
      if (value === null || typeof value === "string") patch[key] = value;
    }
  }

  const settings = await updateSiteSettings(patch);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, settings });
}
