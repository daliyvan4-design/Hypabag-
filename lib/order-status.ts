// Client-safe: labels and the status enum, importable from client components.
// The server-only order store lives in lib/orders.ts.

export type OrderStatus =
  | "en_attente_paiement"
  | "paiement_echoue"
  | "en_preparation"
  | "expediee"
  | "livree"
  | "annulee";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente_paiement: "En attente de paiement",
  paiement_echoue: "Paiement échoué",
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

/** Statuses the atelier sets by hand (payment statuses are system-driven). */
export const MANUAL_STATUSES: OrderStatus[] = [
  "en_preparation",
  "expediee",
  "livree",
  "annulee",
];

export const ORDER_STATUSES = Object.keys(
  ORDER_STATUS_LABELS,
) as OrderStatus[];
