"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type FormEvent } from "react";
import { Striped } from "@/components/striped";
import ui from "@/components/ui.module.css";
import { useCart } from "@/lib/cart";
import { formatEuro } from "@/lib/format";
import styles from "./checkout.module.css";

export default function Checkout() {
  const router = useRouter();
  const { hydrated, lines, subtotal, placeOrder, markOrderEmailed } = useCart();
  const ordering = useRef(false);

  // Nothing to pay for: send them back to the (empty) cart. Placing an order
  // also empties it, so that path has to opt out of the guard.
  useEffect(() => {
    if (hydrated && lines.length === 0 && !ordering.current) {
      router.replace("/panier");
    }
  }, [hydrated, lines.length, router]);

  // No payment processor is wired up: confirming records the order locally and
  // asks the server to email it. Card fields are read by nobody and sent nowhere.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const basket = lines.map((line) => ({ slug: line.slug, qte: line.qte }));

    ordering.current = true;
    const orderNo = placeOrder();
    router.push("/confirmation");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNo,
          email: form.get("email"),
          prenom: form.get("given-name"),
          nom: form.get("family-name"),
          lines: basket,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      markOrderEmailed(
        response.ok &&
          (result as { customerEmailed?: boolean })?.customerEmailed === true,
      );
    } catch {
      // The order still stands; only the email failed.
      markOrderEmailed(false);
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
                  inputMode="numeric"
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
                defaultValue="France"
                aria-label="Pays"
                className={ui.input}
              />

              <div className={ui.formTitle}>Paiement</div>
              <input
                required
                type="text"
                name="cc-number"
                autoComplete="cc-number"
                inputMode="numeric"
                placeholder="Numéro de carte"
                aria-label="Numéro de carte"
                className={ui.input}
              />
              <div className={ui.formRow}>
                <input
                  required
                  type="text"
                  name="cc-exp"
                  autoComplete="cc-exp"
                  placeholder="MM / AA"
                  aria-label="Date d'expiration"
                  className={ui.input}
                />
                <input
                  required
                  type="text"
                  name="cc-csc"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  placeholder="CVC"
                  aria-label="Cryptogramme visuel"
                  className={ui.input}
                />
              </div>
              <input
                required
                type="text"
                name="cc-name"
                autoComplete="cc-name"
                placeholder="Nom sur la carte"
                aria-label="Nom sur la carte"
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

                <button type="submit" className={ui.ctaWide}>
                  Confirmer la commande
                </button>
                <p className={ui.note}>
                  Paiement sécurisé. Aucune donnée n&apos;est conservée.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
