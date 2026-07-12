"use client";

import Link from "next/link";
import { Striped } from "@/components/striped";
import ui from "@/components/ui.module.css";
import { useCart } from "@/lib/cart";
import { formatXof } from "@/lib/format";
import styles from "./panier.module.css";

export default function Panier() {
  const { hydrated, lines, subtotal, changeQty } = useCart();

  return (
    <main className={ui.page}>
      <section className={styles.page}>
        <div className={styles.wrap}>
          <div className={ui.steps}>
            <span className={ui.stepActive}>01 Panier</span>
            <span className={ui.stepRule} />
            <span className={ui.step}>02 Livraison</span>
            <span className={ui.stepRule} />
            <span className={ui.step}>03 Paiement</span>
          </div>

          <h1 className={ui.pageTitle}>Votre sélection</h1>

          {!hydrated ? (
            <div className={styles.placeholder} />
          ) : lines.length === 0 ? (
            <div className={ui.emptyState}>
              <p className={ui.emptyTitle}>Votre panier est vide.</p>
              <p className={ui.emptyText}>
                Chaque pièce attend d&apos;être découverte dans la collection.
              </p>
              <Link href="/collection" className={ui.cta}>
                Voir la collection
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.list}>
                {lines.map((line) => (
                  <div key={line.slug} className={styles.row}>
                    <div className={styles.thumb}>
                      <Striped />
                    </div>
                    <div className={styles.rowBody}>
                      <div className={styles.nom}>{line.nom}</div>
                      <div className={styles.matiere}>{line.matiere}</div>
                    </div>
                    <div className={ui.qty}>
                      <button
                        type="button"
                        className={ui.qtyBtn}
                        onClick={() => changeQty(line.slug, -1)}
                        aria-label={`Retirer un ${line.nom}`}
                      >
                        −
                      </button>
                      <span className={ui.qtyValue}>{line.qte}</span>
                      <button
                        type="button"
                        className={ui.qtyBtn}
                        onClick={() => changeQty(line.slug, 1)}
                        aria-label={`Ajouter un ${line.nom}`}
                      >
                        +
                      </button>
                    </div>
                    <div className={styles.lineTotal}>
                      {formatXof(line.prix * line.qte)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.summary}>
                <div className={ui.summaryRow}>
                  <span>Sous-total</span>
                  <span>{formatXof(subtotal)}</span>
                </div>
                <div className={ui.summaryRow}>
                  <span>Livraison</span>
                  <span style={{ opacity: 0.55 }}>Offerte, sous écrin HYPA</span>
                </div>
                <div className={ui.summaryTotal}>
                  <span>Total</span>
                  <span>{formatXof(subtotal)}</span>
                </div>
              </div>

              <Link href="/checkout" className={ui.ctaWide}>
                Procéder au paiement
              </Link>
              <p className={ui.note}>
                Retours acceptés sous 14 jours. Chaque pièce est vérifiée à la
                main avant expédition.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
