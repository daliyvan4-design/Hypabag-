"use client";

import { useSyncExternalStore } from "react";
import type { Piece } from "./pieces";

const CART_KEY = "hypa_cart";
const ORDER_KEY = "hypa_last_order";

export type CartLine = {
  slug: string;
  nom: string;
  matiere: string;
  prix: number;
  qte: number;
};

export type PlacedOrder = {
  no: string;
  /** Whether Resend actually delivered a confirmation to the customer. */
  emailed: boolean;
};

type Snapshot = {
  lines: CartLine[];
  lastOrder: PlacedOrder | null;
  drawerOpen: boolean;
};

/**
 * The cart lives outside React so that it can be read synchronously during the
 * very first client render. `getServerSnapshot` keeps the hydration pass in
 * agreement with the (cartless) server HTML; React swaps in the real snapshot
 * immediately afterwards.
 */
const EMPTY: Snapshot = { lines: [], lastOrder: null, drawerOpen: false };

let snapshot: Snapshot = EMPTY;
const listeners = new Set<() => void>();

function commit(next: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return EMPTY;
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as CartLine;
  return (
    typeof line.slug === "string" &&
    typeof line.nom === "string" &&
    typeof line.matiere === "string" &&
    typeof line.prix === "number" &&
    typeof line.qte === "number"
  );
}

function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

function persist(lines: CartLine[]) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  } catch {
    // Private browsing or a full quota: the cart stays in memory for the visit.
  }
}

function readOrder(): PlacedOrder | null {
  try {
    const raw = window.sessionStorage.getItem(ORDER_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (typeof parsed !== "object" || parsed === null) return null;
    const order = parsed as PlacedOrder;
    if (typeof order.no !== "string") return null;
    return { no: order.no, emailed: order.emailed === true };
  } catch {
    return null;
  }
}

function persistOrder(order: PlacedOrder | null) {
  try {
    if (order) window.sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
    else window.sessionStorage.removeItem(ORDER_KEY);
  } catch {
    // Non-fatal: the confirmation page redirects home when it finds no order.
  }
}

if (typeof window !== "undefined") {
  snapshot = { lines: readCart(), lastOrder: readOrder(), drawerOpen: false };
}

/* Actions ------------------------------------------------------------------ */

export function add(piece: Piece) {
  const existing = snapshot.lines.some((line) => line.slug === piece.slug);
  const lines = existing
    ? snapshot.lines.map((line) =>
        line.slug === piece.slug ? { ...line, qte: line.qte + 1 } : line,
      )
    : [
        ...snapshot.lines,
        {
          slug: piece.slug,
          nom: piece.nom,
          matiere: piece.matiere,
          prix: piece.prix,
          qte: 1,
        },
      ];
  persist(lines);
  commit({ lines, drawerOpen: true });
}

export function changeQty(slug: string, delta: number) {
  const lines = snapshot.lines
    .map((line) =>
      line.slug === slug ? { ...line, qte: line.qte + delta } : line,
    )
    .filter((line) => line.qte > 0);
  persist(lines);
  commit({ lines });
}

export function openDrawer() {
  commit({ drawerOpen: true });
}

export function closeDrawer() {
  commit({ drawerOpen: false });
}

export function toggleDrawer() {
  commit({ drawerOpen: !snapshot.drawerOpen });
}

/** No payment processor is wired up: this only records the order locally. */
export function placeOrder(): string {
  const orderNo = `HY-${Math.floor(100000 + Math.random() * 899999)}`;
  const order: PlacedOrder = { no: orderNo, emailed: false };
  persistOrder(order);
  persist([]);
  commit({ lines: [], lastOrder: order, drawerOpen: false });
  return orderNo;
}

/** Called once /api/orders reports back, so the confirmation page tells the truth. */
export function markOrderEmailed(emailed: boolean) {
  if (!snapshot.lastOrder) return;
  const order: PlacedOrder = { ...snapshot.lastOrder, emailed };
  persistOrder(order);
  commit({ lastOrder: order });
}

/* Hooks -------------------------------------------------------------------- */

const noopSubscribe = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

export function useCart() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  /** False on the server and through hydration; cart UI waits for this. */
  const hydrated = useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse);

  return {
    hydrated,
    lines: snap.lines,
    lastOrder: snap.lastOrder,
    drawerOpen: snap.drawerOpen,
    count: snap.lines.reduce((total, line) => total + line.qte, 0),
    subtotal: snap.lines.reduce(
      (total, line) => total + line.prix * line.qte,
      0,
    ),
    add,
    changeQty,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    placeOrder,
    markOrderEmailed,
  };
}
