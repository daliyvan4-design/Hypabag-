import { cloudinaryConfigured } from "@/lib/cloudinary";
import { getSiteSettings } from "@/lib/site-settings";
import { MediaManager } from "./media-manager";
import admin from "../../admin.module.css";

export default async function AdminMedia() {
  const settings = await getSiteSettings();

  return (
    <>
      <div className={admin.header}>
        <div>
          <h1 className={admin.title}>Média &amp; vidéos</h1>
          <p className={admin.subtitle}>
            Les vidéos sont hébergées sur Cloudinary et prennent effet
            immédiatement sur le site.
          </p>
        </div>
      </div>
      <MediaManager settings={settings} cloudinaryConfigured={cloudinaryConfigured()} />
    </>
  );
}
