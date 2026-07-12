"use client";

import { useCart } from "@/lib/cart";
import type { Piece } from "@/lib/pieces";
import ui from "./ui.module.css";

export function AddToCart({ piece }: { piece: Piece }) {
  const { add } = useCart();
  const soldOut = piece.stock === 0;

  if (soldOut) {
    return (
      <button type="button" className={ui.ctaDisabled} disabled>
        Épuisé
      </button>
    );
  }

  return (
    <button type="button" className={ui.cta} onClick={() => add(piece)}>
      Ajouter au panier
    </button>
  );
}
