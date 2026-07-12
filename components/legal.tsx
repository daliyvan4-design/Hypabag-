import type { ReactNode } from "react";
import ui from "./ui.module.css";
import styles from "./legal.module.css";

/** Shared shell for the legal / commerce prose pages. */
export function LegalPage({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className={ui.page}>
      <section className={styles.page}>
        <div className={ui.kicker}>{kicker}</div>
        <h1 className={styles.title}>{title}</h1>
        {updated ? (
          <p className={styles.updated}>Dernière mise à jour : {updated}</p>
        ) : null}
        <div className={styles.prose}>{children}</div>
      </section>
    </main>
  );
}

/** A field the maison must complete before publishing. */
export function Fill({ children }: { children: ReactNode }) {
  return <span className={styles.fill}>{children}</span>;
}
