import "server-only";
import { mutateCollection, readCollection } from "./store";

const COLLECTION = "site";

export type SiteSettings = {
  /** Cloudinary URL of the hero background video, or null for the poster still. */
  heroVideo: string | null;
  /** Cloudinary URL of the transition-curtain video, or null for the monogram. */
  loaderVideo: string | null;
};

const DEFAULTS: SiteSettings = {
  heroVideo: null,
  loaderVideo: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const stored = await readCollection<Partial<SiteSettings>>(COLLECTION, {});
  return { ...DEFAULTS, ...stored };
}

export async function updateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  return mutateCollection<SiteSettings>(COLLECTION, DEFAULTS, (current) => ({
    ...current,
    ...patch,
  }));
}
