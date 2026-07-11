"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOGO_FULL } from "@/lib/media";
import styles from "./transition-curtain.module.css";

/** How long the mark holds the screen. Gallery pacing — tune here. */
const INITIAL_MS = 2000;
const BETWEEN_PAGES_MS = 1700;

/** Transactional routes skip the curtain: nobody wants ceremony mid-checkout. */
const INSTANT_ROUTES = new Set(["/panier", "/checkout", "/confirmation"]);

/** `loaderVideo` comes from the store via the root layout; null = monogram. */
export function TransitionCurtain({ loaderVideo }: { loaderVideo: string | null }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const firstRender = useRef(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    if (reduced || (!firstRender.current && INSTANT_ROUTES.has(pathname))) {
      firstRender.current = false;
      setVisible(false);
      return;
    }

    const duration = firstRender.current ? INITIAL_MS : BETWEEN_PAGES_MS;
    firstRender.current = false;
    setVisible(true);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    }

    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  return (
    <div
      className={`${styles.curtain} ${visible ? styles.visible : ""}`}
      aria-hidden
    >
      {loaderVideo ? (
        <video
          ref={videoRef}
          src={loaderVideo}
          muted
          playsInline
          className={styles.video}
        />
      ) : (
        // Fallback for the original loading.mp4 (unretrievable): the wordmark
        // large and centred, breathing, matching the video's composition —
        // ecru screen, mark at min(46%, 460px), mix-blend multiply.
        <span className={styles.wordmark}>
          <Image src={LOGO_FULL} alt="HYPA" width={460} height={460} priority />
        </span>
      )}
    </div>
  );
}
