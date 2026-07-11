import "server-only";
import { mutateCollection, readCollection } from "./store";

export type OrderRecord = {
  orderNo: string;
  createdAt: string;
  email: string;
  prenom: string;
  nom: string;
  lines: { slug: string; nom: string; qte: number; prix: number }[];
  total: number;
  /** Whether Resend delivered the customer confirmation (false in sandbox). */
  emailed: boolean;
};

const COLLECTION = "orders";

export async function recordOrder(order: OrderRecord): Promise<void> {
  await mutateCollection<OrderRecord[]>(COLLECTION, [], (current) => [
    order,
    ...current,
  ]);
}

export async function getOrders(): Promise<OrderRecord[]> {
  return readCollection<OrderRecord[]>(COLLECTION, []);
}
