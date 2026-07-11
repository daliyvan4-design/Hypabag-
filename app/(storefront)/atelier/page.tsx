import type { Metadata } from "next";
import Image from "next/image";
import { Striped } from "@/components/striped";
import ui from "@/components/ui.module.css";
import styles from "./atelier.module.css";

export const metadata: Metadata = {
  title: "L'Atelier",
  description:
    "Dans un atelier parisien, chaque cordon est tressé à la main, brin après brin. Pas de moule, pas de série.",
};

const STATS = [
  { num: "100%", label: "fait main" },
  { num: "3-5j", label: "par pièce" },
  { num: "0", label: "série identique" },
];

export default function Atelier() {
  return (
    <main className={ui.page}>
      <section className={styles.head}>
        <div className={styles.headInner}>
          <div className={ui.kicker}>02 · L&apos;ATELIER</div>
          <h1 className={styles.title}>
            Fait main,
            <br />
            sans exception.
          </h1>
        </div>
      </section>

      <section className={styles.body}>
        <div className={styles.grid}>
          <div>
            <p className={styles.para}>
              Dans un atelier parisien, chaque cordon est tressé à la main, brin
              après brin. Pas de moule, pas de série, un geste répété jusqu&apos;à
              ce que la matière trouve sa forme.
            </p>
            <p className={styles.para}>
              Le fil est choisi pour sa tenue et sa patine. Les mains qui
              tressent connaissent la tension exacte que demande chaque nœud : ni
              trop serré, ni trop lâche.
            </p>
            <p className={styles.quote}>
              « Le tressage ne se presse pas.
              <br />
              Il se laisse faire. »
            </p>
            <div className={styles.stats}>
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className={styles.statNum}>{stat.num}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <figure className={styles.frame}>
              <div className={styles.mat}>
                <Image
                  src="/assets/cordon-macro.jpg"
                  alt="Cordon de coton tressé, vu de près"
                  width={800}
                  height={832}
                />
              </div>
              <figcaption className={styles.cartel}>
                Le cordon, avant qu&apos;il ne devienne pièce.
              </figcaption>
            </figure>

            <div className={styles.inset}>
              <Striped variant="rose" />
              <span className={styles.insetLabel}>
                Geste · mains de l&apos;artisane
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
