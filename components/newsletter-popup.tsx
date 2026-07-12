"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./newsletter-popup.module.css";

/** Show the popup this many times at most, this long apart, and never again
 * once subscribed. Counters persist in localStorage so it doesn't nag. */
const MAX_SHOWS = 2;
const DELAY_MS = 10_000;
const COUNT_KEY = "hypa_nl_popup_count";
const SUBSCRIBED_KEY = "hypa_nl_subscribed";

type Status = "idle" | "sending" | "done" | "error";

function readInt(key: string): number {
  try {
    return Number(window.localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const shownThisSession = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const subscribed = (() => {
      try {
        return window.localStorage.getItem(SUBSCRIBED_KEY) === "1";
      } catch {
        return false;
      }
    })();
    if (subscribed || readInt(COUNT_KEY) >= MAX_SHOWS) return;

    function schedule() {
      timer.current = window.setTimeout(() => {
        const total = readInt(COUNT_KEY);
        if (total >= MAX_SHOWS) return;
        try {
          window.localStorage.setItem(COUNT_KEY, String(total + 1));
        } catch {
          /* ignore */
        }
        shownThisSession.current += 1;
        setOpen(true);
      }, DELAY_MS);
    }

    schedule();
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function dismiss() {
    setOpen(false);
    // Offer it once more (10s later) if we haven't hit the cap yet.
    if (
      status !== "done" &&
      shownThisSession.current < MAX_SHOWS &&
      readInt(COUNT_KEY) < MAX_SHOWS
    ) {
      timer.current = window.setTimeout(() => {
        try {
          window.localStorage.setItem(
            COUNT_KEY,
            String(readInt(COUNT_KEY) + 1),
          );
        } catch {
          /* ignore */
        }
        shownThisSession.current += 1;
        setOpen(true);
      }, DELAY_MS);
    }
  }

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
      if (response.ok) {
        setStatus("done");
        try {
          window.localStorage.setItem(SUBSCRIBED_KEY, "1");
          window.localStorage.setItem(COUNT_KEY, String(MAX_SHOWS));
        } catch {
          /* ignore */
        }
        window.setTimeout(() => setOpen(false), 1800);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      className={`${styles.overlay} ${open ? styles.open : ""}`}
      onClick={dismiss}
      aria-hidden={!open}
    >
      <div
        className={styles.card}
        role="dialog"
        aria-label="Inscription à la newsletter"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={dismiss}
          aria-label="Fermer"
        >
          ×
        </button>
        <div className={styles.kicker}>RESTER PROCHE</div>
        <h2 className={styles.title}>
          Une invitation,
          <br />
          pas une lettre d&apos;info.
        </h2>

        {status === "done" ? (
          <p className={styles.done}>Merci. À très vite.</p>
        ) : (
          <>
            <p className={styles.text}>
              Les nouvelles pièces en avant-première, à mesure qu&apos;elles
              naissent à l&apos;atelier.
            </p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                required
                placeholder="votre adresse email"
                aria-label="Votre adresse email"
                className={styles.input}
                disabled={status === "sending"}
              />
              <button
                type="submit"
                className={styles.button}
                disabled={status === "sending"}
              >
                {status === "sending" ? "…" : "S'inscrire"}
              </button>
              {status === "error" ? (
                <p className={styles.error} role="alert">
                  L&apos;inscription n&apos;a pas abouti. Réessayez.
                </p>
              ) : null}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
