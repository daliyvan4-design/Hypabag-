import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Striped } from "@/components/striped";
import ui from "@/components/ui.module.css";
import { formatEuro } from "@/lib/format";
import { getProducts } from "@/lib/products";
import styles from "./collection.module.css";

// Reads the mutable product store; must reflect backoffice edits immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La Collection",
  description:
    "Sept pièces, sept tressages. Chacune demande trois à cinq jours de travail manuel, aucune n'est répétée à l'identique.",
};

export default async function Collection() {
  const pieces = await getProducts();

  return (
    <main className={ui.page}>
      <section className={ui.pageHead}>
        <div className={ui.kicker}>01 · LA COLLECTION</div>
        <h1 className={ui.pageTitle}>
          Un accrochage,
          <br />
          non un catalogue.
        </h1>
        <p className={ui.lead}>
          Sept pièces, sept tressages. Chacune demande trois à cinq jours de
          travail manuel, aucune n&apos;est répétée à l&apos;identique.
        </p>
      </section>

      <section className={styles.wrap}>
        <div className={styles.grid}>
          {pieces.map((piece, index) => (
            <Link
              key={piece.slug}
              href={`/collection/${piece.slug}`}
              className={styles.card}
              style={{
                width: `${piece.largeur}%`,
                marginTop: piece.decalage,
                animationDelay: `${index * 75}ms`,
              }}
            >
              <div className={styles.imgWrap}>
                {piece.stock === 0 ? (
                  <span className={ui.soldOut}>Épuisé</span>
                ) : null}
                {piece.photo?.src ? (
                  <Image
                    src={piece.photo.src}
                    alt=""
                    fill
                    sizes="(max-width: 860px) 100vw, 33vw"
                    style={{
                      objectFit: "cover",
                      filter: piece.stock === 0 ? "grayscale(0.4) opacity(0.7)" : undefined,
                    }}
                  />
                ) : (
                  <Striped />
                )}
                <div className={styles.matiere}>{piece.matiere}</div>
              </div>
              <div className={styles.meta}>
                <div className={styles.line}>
                  <span className={styles.nom}>{piece.nom}</span>
                  <span className={styles.prix}>{formatEuro(piece.prix)}</span>
                </div>
                <div className={styles.phrase}>{piece.phrase}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
