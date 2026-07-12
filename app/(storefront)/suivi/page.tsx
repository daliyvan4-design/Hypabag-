"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import ui from "@/components/ui.module.css";
import styles from "./suivi.module.css";

type OrderStatus = "en_preparation" | "expediee" | "livree" | "annulee";

type LookupOrder = {
  orderNo: string;
  status: OrderStatus;
  tracking: string | null;
  createdAt: string;
  lines: { nom: string; qte: number }[];
};

// The three forward steps shown as a progress line. "annulee" is handled apart.
const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "en_preparation", label: "En préparation" },
  { key: "expediee", label: "Expédiée" },
  { key: "livree", label: "Livrée" },
];

function stepIndex(status: OrderStatus): number {
  return STEPS.findIndex((s) => s.key === status);
}

function Tracker() {
  const params = useSearchParams();
  const [order, setOrder] = useState<LookupOrder | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("loading");
    setOrder(null);

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo: data.get("orderNo"),
          email: data.get("email"),
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (response.ok) {
        setOrder((result as { order: LookupOrder }).order);
        setStatus("idle");
      } else {
        setStatus("error");
        const err = (result as { error?: string })?.error;
        setMessage(
          err === "too_many_requests"
            ? "Trop de tentatives. Patientez quelques minutes."
            : err === "invalide"
              ? "Vérifiez le numéro (HY-000000) et l'adresse email."
              : "Aucune commande ne correspond à ces informations.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Recherche impossible. Réessayez.");
    }
  }

  const current = order ? stepIndex(order.status) : -1;

  return (
    <main className={ui.page}>
      <section className={styles.page}>
        <div className={ui.kicker}>SUIVI DE COMMANDE</div>
        <h1 className={ui.pageTitle}>Où en est votre pièce ?</h1>
        <p className={ui.lead}>
          Renseignez votre numéro de commande et l&apos;email utilisé lors de
          l&apos;achat.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            name="orderNo"
            required
            defaultValue={params.get("no") ?? ""}
            placeholder="Numéro de commande (HY-000000)"
            aria-label="Numéro de commande"
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Adresse email"
            aria-label="Adresse email"
            className={styles.input}
          />
          <button
            type="submit"
            className={ui.cta}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Recherche…" : "Suivre ma commande"}
          </button>
          {status === "error" ? (
            <p className={styles.error} role="alert">
              {message}
            </p>
          ) : null}
        </form>

        {order ? (
          <div className={styles.result}>
            <div className={styles.resultNo}>COMMANDE N° {order.orderNo}</div>

            {order.status === "annulee" ? (
              <p className={styles.cancelled}>Cette commande a été annulée.</p>
            ) : (
              <div className={styles.steps}>
                {STEPS.map((step, i) => {
                  const done = i <= current;
                  return (
                    <div
                      key={step.key}
                      className={done ? styles.stepDone : styles.step}
                    >
                      <div className={done ? styles.dotDone : styles.dot} />
                      <div
                        className={done ? styles.stepLabelDone : styles.stepLabel}
                      >
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.lines}>
              {order.lines.map((l, i) => (
                <span key={l.nom}>
                  {l.nom} × {l.qte}
                  {i < order.lines.length - 1 ? " · " : ""}
                </span>
              ))}
            </div>

            {order.tracking ? (
              <div className={styles.tracking}>
                <div className={styles.trackingLabel}>Suivi</div>
                {order.tracking}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default function SuiviPage() {
  return (
    <Suspense>
      <Tracker />
    </Suspense>
  );
}
