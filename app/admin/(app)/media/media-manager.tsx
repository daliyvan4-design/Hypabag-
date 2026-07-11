"use client";

import { useRef, useState } from "react";
import type { SiteSettings } from "@/lib/site-settings";
import styles from "./media-manager.module.css";

type Slot = "hero" | "loader";

const COPY: Record<Slot, { title: string; desc: string; fallback: string }> = {
  hero: {
    title: "Vidéo héros",
    desc: "Fond animé de la page d'accueil. Sans vidéo, l'image d'affiche (cordon) est affichée.",
    fallback: "Aucune vidéo — image d'affiche utilisée sur le site.",
  },
  loader: {
    title: "Vidéo de transition",
    desc: "Rideau affiché entre les pages. Sans vidéo, le monogramme animé est affiché.",
    fallback: "Aucune vidéo — monogramme animé utilisé sur le site.",
  },
};

function SlotCard({
  slot,
  initial,
  configured,
}: {
  slot: Slot;
  initial: string | null;
  configured: boolean;
}) {
  const [url, setUrl] = useState(initial);
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const copy = COPY[slot];

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setState("uploading");
    setMessage(`Envoi de ${file.name} vers Cloudinary…`);

    const body = new FormData();
    body.set("file", file);
    body.set("slot", slot);

    try {
      const response = await fetch("/api/admin/media", { method: "POST", body });
      const result: unknown = await response.json().catch(() => null);
      if (response.ok) {
        setUrl((result as { upload: { url: string } }).upload.url);
        setState("idle");
        setMessage("Vidéo en ligne. Elle est active sur le site.");
      } else {
        setState("error");
        const err = (result as { error?: string })?.error;
        setMessage(
          err === "fichier_trop_lourd"
            ? "Fichier trop lourd (max 100 Mo)."
            : err === "video_attendue"
              ? "Le fichier doit être une vidéo."
              : err === "cloudinary_not_configured"
                ? "Cloudinary n'est pas configuré."
                : "Le téléversement a échoué.",
        );
      }
    } catch {
      setState("error");
      setMessage("Téléversement impossible.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function clear() {
    setState("uploading");
    setMessage("");
    try {
      const response = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [slot === "hero" ? "heroVideo" : "loaderVideo"]: null }),
      });
      if (response.ok) {
        setUrl(null);
        setMessage("Vidéo retirée. Le fallback est de nouveau utilisé.");
      } else {
        setMessage("Action impossible.");
      }
      setState("idle");
    } catch {
      setState("error");
      setMessage("Action impossible.");
    }
  }

  return (
    <div className={styles.slot}>
      <div className={styles.slotTitle}>{copy.title}</div>
      <p className={styles.slotDesc}>{copy.desc}</p>

      <div className={styles.preview}>
        {url ? (
          <video src={url} muted loop autoPlay playsInline />
        ) : (
          <span className={styles.previewFallback}>{copy.fallback}</span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileRef.current?.click()}
          disabled={state === "uploading" || !configured}
        >
          {state === "uploading" ? "Téléversement…" : url ? "Remplacer la vidéo" : "Téléverser une vidéo"}
        </button>
        {url ? (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={clear}
            disabled={state === "uploading"}
          >
            Retirer
          </button>
        ) : null}
      </div>

      {message ? (
        <p className={state === "error" ? styles.error : state === "uploading" ? styles.progress : styles.status}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function MediaManager({
  settings,
  cloudinaryConfigured,
}: {
  settings: SiteSettings;
  cloudinaryConfigured: boolean;
}) {
  return (
    <>
      {!cloudinaryConfigured ? (
        <div className={styles.notice}>
          Cloudinary n&apos;est pas configuré : renseignez
          NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et
          CLOUDINARY_API_SECRET pour téléverser des vidéos.
        </div>
      ) : null}
      <div className={styles.slots}>
        <SlotCard slot="hero" initial={settings.heroVideo} configured={cloudinaryConfigured} />
        <SlotCard slot="loader" initial={settings.loaderVideo} configured={cloudinaryConfigured} />
      </div>
    </>
  );
}
