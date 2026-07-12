"use client";

import { useSyncExternalStore } from "react";
import type { Piece } from "./pieces";

const CART_KEY = "hypa_cart";

export type CartLine = {
  slug: string;
  nom: string;
  matiere: string;
  prix: number;
  qte: number;
};

type Snapshot = {
  lines: CartLine[];
  drawerOpen: boolean;
};

/**
 * The cart lives outside React so that it can be read synchronously during the
 * very first client render. `getServerSnapshot` keeps the hydration pass in
 * agreement with the (cartless) server HTML; React swaps in the real snapshot
 * immediately afterwards.
 */
const EMPTY: Snapshot = { lines: [], drawerOpen: false };

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

if (typeof window !== "undefined") {
  snapshot = { lines: readCart(), drawerOpen: false };
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

/** Emptied on the confirmation page once payment has gone through. */
export function clear() {
  persist([]);
  commit({ lines: [], drawerOpen: false });
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
    clear,
  };
}
