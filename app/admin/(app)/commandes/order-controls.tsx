"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-status";
import styles from "./order-controls.module.css";

export function OrderControls({
  orderNo,
  status,
  tracking,
}: {
  orderNo: string;
  status: OrderStatus;
  tracking?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(status);
  const [track, setTrack] = useState(tracking ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  const dirty = value !== status || track !== (tracking ?? "");

  async function save() {
    setState("saving");
    try {
      const response = await fetch(`/api/admin/orders/${orderNo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value, tracking: track }),
      });
      if (response.ok) {
        setState("saved");
        router.refresh();
        window.setTimeout(() => setState("idle"), 1500);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }

  return (
    <div className={styles.wrap}>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => setValue(e.target.value as OrderStatus)}
        aria-label="Statut de la commande"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <input
        className={styles.tracking}
        value={track}
        onChange={(e) => setTrack(e.target.value)}
        placeholder="Suivi (transporteur, n°)"
        aria-label="Numéro de suivi"
      />
      {state === "saved" ? (
        <span className={styles.saved}>Enregistré ✓</span>
      ) : (
        <button
          type="button"
          className={styles.save}
          onClick={save}
          disabled={!dirty || state === "saving"}
        >
          {state === "saving" ? "…" : "Mettre à jour"}
        </button>
      )}
    </div>
  );
}
