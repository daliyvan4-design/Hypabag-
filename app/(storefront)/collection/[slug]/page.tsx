import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { Striped } from "@/components/striped";
import ui from "@/components/ui.module.css";
import { formatEuro } from "@/lib/format";
import { getProduct, getProductNumero } from "@/lib/products";
import styles from "./piece.module.css";

type Params = { params: Promise<{ slug: string }> };

// Reads the mutable product store; must reflect backoffice edits immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const piece = await getProduct(slug);
  if (!piece) return {};
  return { title: piece.nom, description: piece.phrase };
}

export default async function PiecePage({ params }: Params) {
  const { slug } = await params;
  const [piece, numero] = await Promise.all([
    getProduct(slug),
    getProductNumero(slug),
  ]);
  if (!piece) notFound();

  return (
    <main className={ui.page}>
      <div className={styles.breadcrumb}>
        <Link href="/collection" className={styles.breadcrumbLink}>
          La Collection
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{piece.nom}</span>
      </div>

      <section className={styles.wrap}>
        <div className={styles.grid}>
          <div>
            <figure className={styles.frame}>
              {piece.photo ? (
                <>
                  <div className={styles.mat}>
                    <Image
                      src={piece.photo.src}
                      alt={piece.photo.alt}
                      width={800}
                      height={832}
                      priority
                    />
                  </div>
                  <figcaption className={styles.cartel}>
                    {piece.photo.cartel}
                  </figcaption>
                </>
              ) : (
                <>
                  <div className={styles.matStriped}>
                    <Striped />
                  </div>
                  <figcaption className={styles.cartel}>
                    Vue d&apos;atelier à venir.
                  </figcaption>
                </>
              )}
            </figure>

            {piece.vues ? (
              <div className={styles.thumbs}>
                {piece.vues.map((vue) => (
                  <div key={vue.label} className={styles.thumb}>
                    <Striped variant={vue.stripe} />
                    <span className={styles.thumbLabel}>{vue.label}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.text}>
            <div className={ui.kicker}>PIÈCE N°{numero}</div>
            <h1 className={styles.title}>{piece.nom}</h1>
            <div className={styles.subtitle}>
              {piece.sousTitre ?? piece.matiere}
            </div>

            {(piece.paragraphes ?? [piece.phrase]).map((para) => (
              <p key={para} className={styles.para}>
                {para}
              </p>
            ))}

            {piece.specs ? (
              <div className={styles.specs}>
                {piece.specs.map((spec) => (
                  <div key={spec.label} className={styles.specRow}>
                    <span className={styles.specLabel}>{spec.label}</span>
                    <span>{spec.valeur}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className={styles.buy}>
              <div className={styles.price}>{formatEuro(piece.prix)}</div>
              <AddToCart piece={piece} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
