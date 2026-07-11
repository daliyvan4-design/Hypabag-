import Image from "next/image";
import Link from "next/link";
import { Striped } from "@/components/striped";
import ui from "@/components/ui.module.css";
import { HERO_POSTER } from "@/lib/media";
import { getProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/site-settings";
import styles from "./home.module.css";

export default async function Accueil() {
  const [products, { heroVideo }] = await Promise.all([
    getProducts(),
    getSiteSettings(),
  ]);
  const featured = products[0];

  return (
    <main className={ui.page}>
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          {heroVideo ? (
            <video
              src={heroVideo}
              poster={HERO_POSTER}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <Image src={HERO_POSTER} alt="" fill priority sizes="100vw" />
          )}
        </div>
        <div className={styles.heroVeil} />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Chaque nœud
            <br />
            raconte <em>un geste.</em>
          </h1>
          <p className={styles.heroSub}>
            Des pièces tissées à la main à partir d&apos;un unique cordon de
            coton tressé. Aucune machine. Aucune série. Une galerie, plutôt
            qu&apos;une boutique.
          </p>
          <div className={styles.heroActions}>
            <Link href="/collection" className={ui.cta}>
              Entrer dans la collection
            </Link>
            <Link href="/atelier" className={ui.ghost}>
              Visiter l&apos;atelier →
            </Link>
          </div>
          <div className={styles.heroCartel}>
            « Torsade », cordon de coton tressé, teinte bordeaux. Atelier HYPA,
            2026.
          </div>
        </div>
      </section>

      <section className={styles.quote}>
        <p className={styles.quoteText}>
          « On expose une œuvre.
          <br />
          On ne pousse pas un produit. »
        </p>
        <div className={styles.quoteAttrib}>LA MAISON</div>
      </section>

      <section className={styles.teasers}>
        <div className={ui.kicker}>PARCOURIR</div>
        <div className={styles.teaserGrid}>
          <Link href="/collection" className={styles.teaser}>
            <div className={styles.teaserImg}>
              <Striped />
              <span className={styles.teaserNum}>01</span>
            </div>
            <div className={styles.teaserTitle}>La Collection</div>
            <div className={styles.teaserSub}>
              Sept pièces, accrochées comme en galerie.
            </div>
          </Link>

          {featured ? (
            <Link href={`/collection/${featured.slug}`} className={styles.teaser}>
              <div className={styles.teaserImg}>
                {featured.photo?.src ? (
                  <Image
                    src={featured.photo.src}
                    alt=""
                    fill
                    sizes="(max-width: 860px) 100vw, 33vw"
                  />
                ) : (
                  <Striped variant="rose" />
                )}
                <span className={featured.photo?.src ? styles.teaserNumLight : styles.teaserNum}>
                  02
                </span>
              </div>
              <div className={styles.teaserTitle}>Pièce n°01 · {featured.nom}</div>
              <div className={styles.teaserSub}>{featured.phrase}</div>
            </Link>
          ) : null}

          <Link href="/atelier" className={styles.teaser}>
            <div className={styles.teaserImg}>
              <Image
                src="/assets/cordon-macro.jpg"
                alt=""
                fill
                sizes="(max-width: 860px) 100vw, 33vw"
              />
              <span className={styles.teaserNumLight}>03</span>
            </div>
            <div className={styles.teaserTitle}>L&apos;Atelier</div>
            <div className={styles.teaserSub}>
              Le récit du fait main, brin après brin.
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
