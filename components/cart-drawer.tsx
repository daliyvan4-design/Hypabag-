"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { formatEuro } from "@/lib/format";
import { Striped } from "./striped";
import styles from "./cart-drawer.module.css";
import ui from "./ui.module.css";

export function CartDrawer() {
  const { hydrated, lines, subtotal, drawerOpen, closeDrawer, changeQty } =
    useCart();
  const pathname = usePathname();

  useEffect(() => closeDrawer(), [pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen, closeDrawer]);

  const empty = hydrated && lines.length === 0;

  return (
    <>
      <div
        className={`${styles.overlay} ${drawerOpen ? styles.overlayOpen : ""}`}
        onClick={closeDrawer}
        aria-hidden
      />
      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
        aria-label="Votre sélection"
        inert={!drawerOpen}
      >
        <div className={styles.head}>
          <span className={styles.title}>Votre sélection</span>
          <button
            type="button"
            onClick={closeDrawer}
            className={styles.close}
            aria-label="Fermer le panier"
          >
            ×
          </button>
        </div>

        {!hydrated ? null : empty ? (
          <div className={styles.empty}>
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
                  </div>
                  <div className={styles.prix}>
                    {formatEuro(line.prix * line.qte)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.foot}>
              <div className={ui.summaryTotal}>
                <span>Total</span>
                <span>{formatEuro(subtotal)}</span>
              </div>
              <Link href="/checkout" className={ui.ctaWide}>
                Procéder au paiement
              </Link>
              <Link href="/panier" className={ui.ghostCentered}>
                Voir le panier complet
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
