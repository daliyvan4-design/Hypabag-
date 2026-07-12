"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import ui from "@/components/ui.module.css";
import { clear } from "@/lib/cart";
import styles from "./confirmation.module.css";

function ConfirmationInner() {
  const router = useRouter();
  const params = useSearchParams();
  const orderNo = params.get("no");
  const cleared = useRef(false);

  // Reached from the Genius Pay success redirect (?no=…). Empty the cart once
  // (the webhook is what actually confirms and emails the order); with no order
  // number it was reached by mistake, so send them home.
  useEffect(() => {
    if (!orderNo) {
      router.replace("/");
      return;
    }
    if (!cleared.current) {
      cleared.current = true;
      clear();
    }
  }, [orderNo, router]);

  if (!orderNo) return <main className={ui.page} />;

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

        <div className={ui.kicker}>PAIEMENT REÇU</div>
        <h1 className={styles.title}>Merci.</h1>
        <p className={styles.text}>
          Votre paiement est confirmé et votre pièce entre en préparation à
          l&apos;atelier. Un email de confirmation vous parvient, puis un suivi
          dès l&apos;expédition.
        </p>
        <div className={styles.orderNo}>Commande N° {orderNo}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href={`/suivi?no=${orderNo}`} className={ui.cta}>
            Suivre ma commande
          </Link>
          <Link href="/collection" className={ui.ghost} style={{ alignSelf: "center" }}>
            Poursuivre la visite →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function Confirmation() {
  return (
    <Suspense fallback={<main className={ui.page} />}>
      <ConfirmationInner />
    </Suspense>
  );
}
