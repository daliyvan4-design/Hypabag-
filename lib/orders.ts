import "server-only";
import { mutateCollection, readCollection } from "./store";
import type { OrderStatus } from "./order-status";

export {
  ORDER_STATUSES,
  MANUAL_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "./order-status";

export type OrderRecord = {
  orderNo: string;
  createdAt: string;
  updatedAt?: string;
  email: string;
  prenom: string;
  nom: string;
  phone?: string;
  lines: { slug: string; nom: string; qte: number; prix: number }[];
  /** Catalogue total in euros. */
  total: number;
  /** Amount actually charged, in XOF (Genius Pay). */
  amountXof?: number;
  /** Genius Pay transaction reference (MTX-…). */
  paymentRef?: string;
  paid: boolean;
  /** Whether Resend delivered the customer confirmation (false in sandbox). */
  emailed: boolean;
  status: OrderStatus;
  /** Carrier + tracking number, set when the piece ships. */
  tracking?: string;
};

const COLLECTION = "orders";

/** Records an order awaiting payment (before redirecting to Genius Pay). */
export async function recordPendingOrder(
  order: Omit<OrderRecord, "status" | "paid" | "emailed">,
): Promise<void> {
  await mutateCollection<OrderRecord[]>(COLLECTION, [], (current) => [
    { ...order, status: "en_attente_paiement", paid: false, emailed: false },
    ...current,
  ]);
}

export async function getOrders(): Promise<OrderRecord[]> {
  return readCollection<OrderRecord[]>(COLLECTION, []);
}

export async function getOrder(orderNo: string): Promise<OrderRecord | null> {
  const orders = await getOrders();
  return orders.find((o) => o.orderNo === orderNo) ?? null;
}

/** Look up a single order, but only when the email matches (no enumeration). */
export async function findOrder(
  orderNo: string,
  email: string,
): Promise<OrderRecord | null> {
  const order = await getOrder(orderNo);
  if (!order) return null;
  if (order.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
    return null;
  }
  return order;
}

export async function updateOrder(
  orderNo: string,
  patch: Partial<
    Pick<
      OrderRecord,
      "status" | "tracking" | "paid" | "emailed" | "amountXof" | "paymentRef"
    >
  >,
): Promise<OrderRecord | null> {
  let updated: OrderRecord | null = null;
  await mutateCollection<OrderRecord[]>(COLLECTION, [], (current) =>
    current.map((order) => {
      if (order.orderNo !== orderNo) return order;
      updated = { ...order, ...patch, updatedAt: new Date().toISOString() };
      return updated;
    }),
  );
  return updated;
}
