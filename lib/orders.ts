import "server-only";
import { mutateCollection, readCollection } from "./store";
import type { OrderStatus } from "./order-status";

export {
  ORDER_STATUSES,
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
  lines: { slug: string; nom: string; qte: number; prix: number }[];
  total: number;
  /** Whether Resend delivered the customer confirmation (false in sandbox). */
  emailed: boolean;
  status: OrderStatus;
  /** Carrier + tracking number, set when the piece ships. */
  tracking?: string;
};

const COLLECTION = "orders";

export async function recordOrder(
  order: Omit<OrderRecord, "status">,
): Promise<void> {
  await mutateCollection<OrderRecord[]>(COLLECTION, [], (current) => [
    { ...order, status: "en_preparation" },
    ...current,
  ]);
}

export async function getOrders(): Promise<OrderRecord[]> {
  return readCollection<OrderRecord[]>(COLLECTION, []);
}

/** Look up a single order, but only when the email matches (no enumeration). */
export async function findOrder(
  orderNo: string,
  email: string,
): Promise<OrderRecord | null> {
  const orders = await getOrders();
  const order = orders.find((o) => o.orderNo === orderNo);
  if (!order) return null;
  if (order.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
    return null;
  }
  return order;
}

export async function updateOrder(
  orderNo: string,
  patch: { status?: OrderStatus; tracking?: string },
): Promise<OrderRecord | null> {
  let updated: OrderRecord | null = null;
  await mutateCollection<OrderRecord[]>(COLLECTION, [], (current) =>
    current.map((order) => {
      if (order.orderNo !== orderNo) return order;
      updated = {
        ...order,
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.tracking !== undefined ? { tracking: patch.tracking } : {}),
        updatedAt: new Date().toISOString(),
      };
      return updated;
    }),
  );
  return updated;
}
