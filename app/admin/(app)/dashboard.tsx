"use client";

import { useMemo, useState } from "react";
import { formatXof } from "@/lib/format";
import type { OrderRecord } from "@/lib/orders";
import styles from "./dashboard.module.css";
import admin from "../admin.module.css";

type Period = { label: string; days: number | null };

const PERIODS: Period[] = [
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "Tout", days: null },
];

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function Dashboard({
  orders,
  productCount,
  subscriberCount,
}: {
  orders: OrderRecord[];
  productCount: number;
  subscriberCount: number;
}) {
  const [period, setPeriod] = useState<Period>(PERIODS[1]);
  // Freeze "now" at mount so the memo stays pure and the buckets don't shift
  // mid-session.
  const [now] = useState(() => Date.now());

  const view = useMemo(() => {
    const cutoff = period.days === null ? 0 : now - period.days * 86_400_000;
    // Only paid orders count as revenue; pending/failed payments don't.
    const inWindow = orders.filter(
      (o) => o.paid && new Date(o.createdAt).getTime() >= cutoff,
    );
    const revenue = inWindow.reduce((sum, o) => sum + o.total, 0);

    // One bucket per day across the window (default 14 for "tout").
    const spanDays = period.days ?? 14;
    const buckets: { label: string; total: number }[] = [];
    for (let i = spanDays - 1; i >= 0; i -= 1) {
      const date = new Date(now - i * 86_400_000);
      const key = date.toISOString().slice(0, 10);
      const total = inWindow
        .filter((o) => dayKey(o.createdAt) === key)
        .reduce((sum, o) => sum + o.total, 0);
      buckets.push({
        label: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        total,
      });
    }
    const peak = Math.max(1, ...buckets.map((b) => b.total));

    return { count: inWindow.length, revenue, buckets, peak };
  }, [orders, period, now]);

  // Show at most ~30 bars so labels stay legible.
  const bars = view.buckets.length > 30 ? view.buckets.slice(-30) : view.buckets;

  return (
    <>
      <div className={admin.statGrid}>
        <div className={admin.stat}>
          <div className={admin.statLabel}>Commandes</div>
          <div className={admin.statValue}>{view.count}</div>
          <div className={admin.statHint}>sur la période</div>
        </div>
        <div className={admin.stat}>
          <div className={admin.statLabel}>Chiffre d&apos;affaires</div>
          <div className={admin.statValue}>{formatXof(view.revenue)}</div>
          <div className={admin.statHint}>commandes enregistrées</div>
        </div>
        <div className={admin.stat}>
          <div className={admin.statLabel}>Pièces au catalogue</div>
          <div className={admin.statValue}>{productCount}</div>
          <div className={admin.statHint}>en ligne</div>
        </div>
        <div className={admin.stat}>
          <div className={admin.statLabel}>Inscrits newsletter</div>
          <div className={admin.statValue}>{subscriberCount}</div>
          <div className={admin.statHint}>au total</div>
        </div>
      </div>

      <div className={styles.chartPanel}>
        <div className={styles.chartHead}>
          <div className={styles.chartTitle}>Chiffre d&apos;affaires par jour</div>
          <div className={styles.periods} role="group" aria-label="Période">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={p.label === period.label ? styles.periodActive : styles.period}
                onClick={() => setPeriod(p)}
                aria-pressed={p.label === period.label}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {view.revenue === 0 ? (
          <div className={styles.chartEmpty}>
            Aucune commande sur la période.
          </div>
        ) : (
          <div className={styles.chart}>
            {bars.map((bucket, index) => (
              <div className={styles.bar} key={`${bucket.label}-${index}`}>
                <div
                  className={bucket.total > 0 ? styles.barFill : styles.barFillEmpty}
                  style={{ height: `${(bucket.total / view.peak) * 100}%` }}
                  title={`${bucket.label} · ${formatXof(bucket.total)}`}
                />
                <span className={styles.barLabel}>{bucket.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
