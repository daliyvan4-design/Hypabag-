import type { Stripe } from "@/lib/pieces";
import ui from "./ui.module.css";

/** Stands in for product photography that hasn't been shot yet. */
export function Striped({ variant = "sable" }: { variant?: Stripe }) {
  return (
    <div
      aria-hidden
      className={variant === "rose" ? ui.stripedRose : ui.striped}
    />
  );
}
