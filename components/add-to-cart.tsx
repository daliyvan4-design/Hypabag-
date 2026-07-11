"use client";

import { useCart } from "@/lib/cart";
import type { Piece } from "@/lib/pieces";
import ui from "./ui.module.css";

export function AddToCart({ piece }: { piece: Piece }) {
  const { add } = useCart();

  return (
    <button type="button" className={ui.cta} onClick={() => add(piece)}>
      Ajouter au panier
    </button>
  );
}
