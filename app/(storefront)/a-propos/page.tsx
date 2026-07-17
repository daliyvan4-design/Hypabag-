import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ui from "@/components/ui.module.css";
import styles from "./a-propos.module.css";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "HYPA façonne des pièces de maroquinerie tissées à la main, à partir d'un unique cordon de coton. Aucune machine, aucune série : une galerie, plutôt qu'une boutique.",
};

const PRINCIPLES = [
  {
    num: "01",
    name: "Fait main",
    text: "Chaque pièce naît d'un seul cordon, tressé à la main sans interruption. Pas de moule, pas de machine.",
  },
  {
    num: "02",
    name: "Aucune série",
    text: "Aucune pièce ne ressemble tout à fait à une autre. La main laisse sa trace ; c'est ce qui la rend unique.",
  },
  {
    num: "03",
    name: "Le temps",
    text: "Trois à cinq jours de travail pour une seule pièce. Le tressage ne se presse pas, il se laisse faire.",
  },
];

export default function APropos() {
  return (
    <main className={ui.page}>
      <section className={styles.head}>
        <div className={ui.kicker}>LA MAISON</div>
        <h1 className={styles.title}>
          Une galerie,
          <br />
          plutôt qu&apos;<em>une boutique.</em>
        </h1>
        <p className={styles.lead}>
          HYPA est née d&apos;une conviction simple : un sac peut être une œuvre.
          Non pas un objet produit en série, mais une pièce tissée à la main, à
          partir d&apos;un unique cordon de coton, par une seule paire de mains.
        </p>
      </section>

      <section className={styles.split}>
        <div>
          <p className={styles.para}>
            Nous ne poussons pas des produits, nous exposons des pièces. Chacune
            est pensée comme une œuvre : accrochée, cartellée, présentée pour ce
            qu&apos;elle est — le résultat d&apos;un geste patient, répété jusqu&apos;à
            ce que la matière trouve sa forme.
          </p>
          <p className={styles.para}>
            Le fil est choisi pour sa tenue et sa patine. Les mains qui tressent
            connaissent la tension exacte que demande chaque nœud : ni trop
            serré, ni trop lâche. De cette exigence naît une maroquinerie qui
            vieillit avec vous plutôt que de s&apos;user.
          </p>
        </div>
        <figure className={styles.figure}>
          <div className={styles.frame}>
            <Image
              src="/assets/cordon-macro.jpg"
              alt="Cordon de coton tressé, vu de près"
              width={800}
              height={832}
              priority
            />
          </div>
          <figcaption className={styles.cartel}>
            Le cordon, avant qu&apos;il ne devienne pièce.
          </figcaption>
        </figure>
      </section>

      <section className={styles.quote}>
        <p className={styles.quoteText}>
          « On expose une œuvre.
          <br />
          On ne pousse pas un produit. »
        </p>
        <div className={styles.quoteAttrib}>LA MAISON</div>
      </section>

      <section className={styles.principles}>
        <div className={ui.kicker}>CE QUI NOUS TIENT</div>
        <div className={styles.grid}>
          {PRINCIPLES.map((p) => (
            <div key={p.num} className={styles.principle}>
              <div className={styles.num}>{p.num}</div>
              <div className={styles.name}>{p.name}</div>
              <div className={styles.text}>{p.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.closing}>
        <h2 className={styles.closingTitle}>
          Chaque nœud raconte un geste.
        </h2>
        <Link href="/collection" className={ui.cta}>
          Entrer dans la collection
        </Link>
      </section>
    </main>
  );
}
