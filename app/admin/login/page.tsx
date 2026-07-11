"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { LOGO_MARK } from "@/lib/media";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    setStatus("sending");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const from = params.get("from");
        router.replace(from && from.startsWith("/admin") ? from : "/admin");
        router.refresh();
        return;
      }

      const body: unknown = await response.json().catch(() => null);
      const error = (body as { error?: string })?.error;
      setStatus("error");
      setMessage(
        error === "admin_not_configured"
          ? "Backoffice non configuré : définissez ADMIN_PASSWORD et ADMIN_SESSION_SECRET."
          : error === "too_many_requests"
            ? "Trop de tentatives. Patientez quelques minutes."
            : "Mot de passe incorrect.",
      );
    } catch {
      setStatus("error");
      setMessage("Connexion impossible. Réessayez.");
    }
  }

  return (
    <div className={styles.screen}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <span className={styles.mark}>
          <Image src={LOGO_MARK} alt="" width={30} height={30} priority />
        </span>
        <h1 className={styles.title}>Backoffice HYPA</h1>
        <p className={styles.subtitle}>Espace réservé à l&apos;atelier.</p>

        <label className={styles.label} htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className={styles.input}
          disabled={status === "sending"}
        />

        <button type="submit" className={styles.button} disabled={status === "sending"}>
          {status === "sending" ? "…" : "Entrer"}
        </button>

        {status === "error" ? (
          <p className={styles.error} role="alert">
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
