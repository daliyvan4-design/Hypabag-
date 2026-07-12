// Client-safe: labels and the status enum, importable from client components.
// The server-only order store lives in lib/orders.ts.

export type OrderStatus =
  | "en_preparation"
  | "expediee"
  | "livree"
  | "annulee";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_preparation: "En préparation",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

export const ORDER_STATUSES = Object.keys(
  ORDER_STATUS_LABELS,
) as OrderStatus[];
