import { formatEuro } from "@/lib/format";
import { getOrders } from "@/lib/orders";
import { getSubscribers } from "@/lib/subscribers";
import { OrderControls } from "./order-controls";
import admin from "../../admin.module.css";

function frenchDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrders() {
  const [orders, subscribers] = await Promise.all([
    getOrders(),
    getSubscribers(),
  ]);

  return (
    <>
      <div className={admin.header}>
        <div>
          <h1 className={admin.title}>Commandes</h1>
          <p className={admin.subtitle}>
            {orders.length} commande{orders.length > 1 ? "s" : ""} ·{" "}
            {subscribers.length} inscrit{subscribers.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className={admin.panel}>
        <div className={admin.panelTitle}>Toutes les commandes</div>
        <div className={admin.tableScroll}>
          <table className={admin.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Commande</th>
                <th>Client</th>
                <th>Détail</th>
                <th className={admin.right}>Total</th>
                <th>Email</th>
                <th>Statut &amp; suivi</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className={admin.empty}>
                    Aucune commande enregistrée.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderNo}>
                    <td style={{ whiteSpace: "nowrap", opacity: 0.7 }}>
                      {frenchDate(order.createdAt)}
                    </td>
                    <td className={admin.mono}>{order.orderNo}</td>
                    <td>
                      {order.prenom} {order.nom}
                      <br />
                      <span style={{ opacity: 0.5, fontSize: 12 }}>{order.email}</span>
                    </td>
                    <td style={{ fontSize: 12.5 }}>
                      {order.lines.map((line) => (
                        <div key={line.slug}>
                          {line.nom} × {line.qte}
                        </div>
                      ))}
                    </td>
                    <td className={`${admin.right} ${admin.mono}`}>
                      {formatEuro(order.total)}
                    </td>
                    <td>
                      <span className={order.emailed ? admin.tag : admin.tagMuted}>
                        {order.emailed ? "envoyé" : "non envoyé"}
                      </span>
                    </td>
                    <td>
                      <OrderControls
                        orderNo={order.orderNo}
                        status={order.status}
                        tracking={order.tracking}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={admin.panel}>
        <div className={admin.panelTitle}>Inscrits à la newsletter</div>
        <div className={admin.tableScroll}>
          <table className={admin.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th className={admin.right}>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={2} className={admin.empty}>
                    Aucun inscrit pour l&apos;instant.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.email}>
                    <td>{sub.email}</td>
                    <td className={`${admin.right}`} style={{ opacity: 0.7, whiteSpace: "nowrap" }}>
                      {frenchDate(sub.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
