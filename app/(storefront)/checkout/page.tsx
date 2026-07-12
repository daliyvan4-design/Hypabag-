"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { Striped } from "@/components/striped";
import ui from "@/components/ui.module.css";
import { useCart } from "@/lib/cart";
import { eurToXof, formatEuro, formatXof } from "@/lib/format";
import styles from "./checkout.module.css";

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { hydrated, lines, subtotal } = useCart();
  const [status, setStatus] = useState<"idle" | "redirecting" | "error">(
    "idle",
  );
  const [message, setMessage] = useState(
    params.get("error") === "paiement"
      ? "Le paiement n'a pas abouti. Vous pouvez réessayer."
      : "",
  );

  // Empty cart: nothing to pay for.
  useEffect(() => {
    if (hydrated && lines.length === 0) router.replace("/panier");
  }, [hydrated, lines.length, router]);

  // Genius Pay hosts the payment: we create a transaction, then redirect the
  // customer to the checkout_url. The webhook confirms the order afterwards.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("redirecting");
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          prenom: form.get("given-name"),
          nom: form.get("family-name"),
          phone: form.get("tel"),
          lines: lines.map((l) => ({ slug: l.slug, qte: l.qte })),
        }),
      });
      const result: unknown = await response.json().catch(() => null);

      if (response.ok) {
        const url = (result as { checkoutUrl?: string }).checkoutUrl;
        if (url) {
          window.location.href = url; // leave for the Genius Pay hosted page
          return;
        }
      }

      setStatus("error");
      const err = (result as { error?: string })?.error;
      setMessage(
        err === "rupture"
          ? "Une pièce de votre panier vient d'être épuisée."
          : err === "payment_not_configured"
            ? "Le paiement n'est pas encore configuré."
            : "Impossible d'ouvrir le paiement. Réessayez dans un instant.",
      );
    } catch {
      setStatus("error");
      setMessage("Connexion au paiement impossible. Réessayez.");
    }
  }

  if (!hydrated || lines.length === 0) return <main className={ui.page} />;

  return (
    <main className={ui.page}>
      <section className={styles.page}>
        <div className={styles.wrap}>
          <div className={ui.steps}>
            <Link href="/panier" className={ui.stepDone}>
              01 Panier
            </Link>
            <span className={ui.stepRule} />
            <span className={ui.stepActive}>02 Livraison</span>
            <span className={ui.stepRule} />
            <span className={ui.stepActive}>03 Paiement</span>
          </div>

          <h1 className={ui.pageTitle}>Finaliser</h1>

          <form className={styles.grid} onSubmit={handleSubmit}>
            <div className={styles.form}>
              <div className={ui.formTitle}>Coordonnées</div>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Adresse email"
                aria-label="Adresse email"
                className={ui.input}
              />
              <div className={ui.formRow}>
                <input
                  required
                  type="text"
                  name="given-name"
                  autoComplete="given-name"
                  placeholder="Prénom"
                  aria-label="Prénom"
                  className={ui.input}
                />
                <input
                  required
                  type="text"
                  name="family-name"
                  autoComplete="family-name"
                  placeholder="Nom"
                  aria-label="Nom"
                  className={ui.input}
                />
              </div>
              <input
                required
                type="tel"
                name="tel"
                autoComplete="tel"
                placeholder="Téléphone (ex. +225 07 00 00 00 00)"
                aria-label="Téléphone"
                className={ui.input}
              />

              <div className={ui.formTitle}>Livraison</div>
              <input
                required
                type="text"
                name="address-line1"
                autoComplete="address-line1"
                placeholder="Adresse"
                aria-label="Adresse"
                className={ui.input}
              />
              <input
                type="text"
                name="address-line2"
                autoComplete="address-line2"
                placeholder="Complément d'adresse (optionnel)"
                aria-label="Complément d'adresse"
                className={ui.input}
              />
              <div className={ui.formRow}>
                <input
                  required
                  type="text"
                  name="postal-code"
                  autoComplete="postal-code"
                  placeholder="Code postal"
                  aria-label="Code postal"
                  className={ui.input}
                />
                <input
                  required
                  type="text"
                  name="city"
                  autoComplete="address-level2"
                  placeholder="Ville"
                  aria-label="Ville"
                  className={ui.input}
                />
              </div>
              <input
                required
                type="text"
                name="country"
                autoComplete="country-name"
                defaultValue="Côte d'Ivoire"
                aria-label="Pays"
                className={ui.input}
              />
            </div>

            <div>
              <div className={styles.recap}>
                <div className={ui.formTitle}>Votre commande</div>

                {lines.map((line) => (
                  <div key={line.slug} className={styles.recapRow}>
                    <div className={styles.recapThumb}>
                      <Striped />
                    </div>
                    <div className={styles.recapBody}>
                      <div className={styles.recapNom}>{line.nom}</div>
                      <div className={styles.recapQte}>Qté {line.qte}</div>
                    </div>
                    <div className={styles.recapPrix}>
                      {formatEuro(line.prix * line.qte)}
                    </div>
                  </div>
                ))}

                <div className={styles.recapDivider} />
                <div className={ui.summaryRow}>
                  <span>Sous-total</span>
                  <span>{formatEuro(subtotal)}</span>
                </div>
                <div className={ui.summaryRow}>
                  <span>Livraison</span>
                  <span style={{ opacity: 0.55 }}>Offerte</span>
                </div>
                <div className={ui.summaryTotal}>
                  <span>Total</span>
                  <span>{formatEuro(subtotal)}</span>
                </div>
                <div className={styles.xof}>
                  Débité {formatXof(eurToXof(subtotal))} via Genius Pay
                </div>

                <button
                  type="submit"
                  className={ui.ctaWide}
                  disabled={status === "redirecting"}
                >
                  {status === "redirecting"
                    ? "Ouverture du paiement…"
                    : "Payer"}
                </button>
                {message ? (
                  <p className={styles.payError} role="alert">
                    {message}
                  </p>
                ) : (
                  <p className={ui.note}>
                    Paiement sécurisé via Genius Pay (Wave, Orange Money, MTN,
                    carte).
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<main className={ui.page} />}>
      <CheckoutForm />
    </Suspense>
  );
}
