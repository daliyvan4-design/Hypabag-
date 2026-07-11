"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ui from "@/components/ui.module.css";
import { useCart } from "@/lib/cart";
import styles from "./confirmation.module.css";

export default function Confirmation() {
  const router = useRouter();
  const { hydrated, lastOrder } = useCart();

  // Reached without an order behind it (a bookmark, a refreshed tab).
  useEffect(() => {
    if (hydrated && !lastOrder) router.replace("/");
  }, [hydrated, lastOrder, router]);

  if (!hydrated || !lastOrder) return <main className={ui.page} />;

  return (
    <main className={ui.page}>
      <section className={styles.page}>
        <svg
          viewBox="0 0 220 40"
          className={styles.rule}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,20 C22,4 44,36 66,20 C88,4 110,36 132,20 C154,4 176,36 198,20 C210,12 214,16 220,20"
            fill="none"
            stroke="#632434"
            strokeWidth="2.4"
          />
        </svg>

        <div className={ui.kicker}>COMMANDE CONFIRMÉE</div>
        <h1 className={styles.title}>Merci.</h1>
        <p className={styles.text}>
          Votre pièce entre en préparation à l&apos;atelier.{" "}
          {lastOrder.emailed
            ? "Vous recevrez un email de confirmation, puis un suivi dès l'expédition."
            : "Notez votre numéro de commande : nous vous écrirons dès l'expédition."}
        </p>
        <div className={styles.orderNo}>Commande N° {lastOrder.no}</div>
        <Link href="/collection" className={ui.cta}>
          Poursuivre la visite
        </Link>
      </section>
    </main>
  );
}
