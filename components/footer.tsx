"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { LOGO_MARK } from "@/lib/media";
import styles from "./footer.module.css";

type Status = "idle" | "sending" | "done" | "error";

export function Footer() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setStatus("sending");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(response.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className={styles.footer}>
      <svg
        viewBox="0 0 800 40"
        className={styles.rule}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,20 C40,4 80,36 120,20 C160,4 200,36 240,20 C280,4 320,36 360,20 C400,4 440,36 480,20 C520,4 560,36 600,20 C640,4 680,36 720,20 C760,4 780,10 800,20"
          fill="none"
          stroke="#DCB4AD"
          strokeWidth="3"
        />
      </svg>

      <div className={styles.top}>
        <div className={styles.left}>
          <div className={styles.kicker}>RESTER PROCHE</div>
          <h2 className={styles.title}>
            Une invitation,
            <br />
            pas une lettre d&apos;info.
          </h2>
          <p className={styles.blurb}>
            Les nouvelles pièces, en avant-première, à mesure qu&apos;elles
            naissent à l&apos;atelier.
          </p>

          {status === "done" ? (
            <p className={styles.newsletterDone} role="status">
              Merci. Nous vous écrirons à la prochaine pièce.
            </p>
          ) : (
            <>
              <form className={styles.newsletter} onSubmit={handleSubmit}>
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="votre adresse email"
                  aria-label="Votre adresse email"
                  className={styles.newsletterInput}
                  disabled={status === "sending"}
                />
                <button
                  type="submit"
                  className={styles.newsletterBtn}
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "…" : "S'inscrire"}
                </button>
              </form>
              {status === "error" ? (
                <p className={styles.newsletterError} role="alert">
                  L&apos;inscription n&apos;a pas abouti. Réessayez dans un
                  instant.
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className={styles.columns}>
          <div>
            <div className={styles.columnTitle}>Maison</div>
            <Link href="/" className={styles.link}>
              Accueil
            </Link>
            <Link href="/atelier" className={styles.link}>
              L&apos;Atelier
            </Link>
            <Link href="/collection" className={styles.link}>
              La Collection
            </Link>
          </div>
          <div>
            <div className={styles.columnTitle}>Service</div>
            <Link href="/panier" className={styles.link}>
              Panier
            </Link>
            <Link href="/suivi" className={styles.link}>
              Suivi de commande
            </Link>
            <span className={styles.linkMuted}>Livraison</span>
            <span className={styles.linkMuted}>Retours</span>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <Image src={LOGO_MARK} alt="" width={20} height={20} />
        <span>© 2026 HYPA · Maroquinerie artisanale, Paris</span>
      </div>
    </footer>
  );
}
