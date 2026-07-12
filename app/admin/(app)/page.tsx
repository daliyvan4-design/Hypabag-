import Link from "next/link";
import { emailConfig } from "@/lib/email";
import { formatXof } from "@/lib/format";
import { getOrders } from "@/lib/orders";
import { getProducts } from "@/lib/products";
import { getSubscribers } from "@/lib/subscribers";
import { Dashboard } from "./dashboard";
import styles from "../admin.module.css";

export default async function AdminDashboard() {
  const [orders, products, subscribers] = await Promise.all([
    getOrders(),
    getProducts(),
    getSubscribers(),
  ]);

  const config = emailConfig();
  const recent = orders.slice(0, 8);

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tableau de bord</h1>
          <p className={styles.subtitle}>
            Vue d&apos;ensemble de l&apos;atelier.
          </p>
        </div>
      </div>

      {!config ? (
        <div className={styles.notice}>
          Resend n&apos;est pas configuré : les commandes et inscriptions sont
          enregistrées mais aucun email n&apos;est envoyé.
        </div>
      ) : config.sandbox ? (
        <div className={styles.notice}>
          Mode bac à sable Resend : les clients ne reçoivent pas encore leurs
          emails (seul {config.shop} est notifié). Vérifiez un domaine pour
          basculer en production.
        </div>
      ) : null}

      <Dashboard
        orders={orders}
        productCount={products.length}
        subscriberCount={subscribers.length}
      />

      <div className={styles.panel}>
        <div className={styles.panelTitle}>Dernières commandes</div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Pièces</th>
                <th className={styles.right}>Total</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    Aucune commande pour l&apos;instant.
                  </td>
                </tr>
              ) : (
                recent.map((order) => (
                  <tr key={order.orderNo}>
                    <td className={styles.mono}>{order.orderNo}</td>
                    <td>
                      {order.prenom} {order.nom}
                      <br />
                      <span style={{ opacity: 0.5, fontSize: 12 }}>
                        {order.email}
                      </span>
                    </td>
                    <td>
                      {order.lines.reduce((sum, l) => sum + l.qte, 0)} article
                      {order.lines.reduce((sum, l) => sum + l.qte, 0) > 1 ? "s" : ""}
                    </td>
                    <td className={`${styles.right} ${styles.mono}`}>
                      {formatXof(order.total)}
                    </td>
                    <td>
                      <span className={order.emailed ? styles.tag : styles.tagMuted}>
                        {order.emailed ? "envoyé" : "non envoyé"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className={styles.subtitle}>
        <Link href="/admin/produits" style={{ color: "var(--bordeaux)" }}>
          Gérer les produits →
        </Link>
      </p>
    </>
  );
}
