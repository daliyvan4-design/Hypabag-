import { describe, expect, it } from "vitest";
import {
  MANUAL_STATUSES,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from "@/lib/order-status";

describe("order status", () => {
  it("labels every status", () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("keeps payment states out of the manual (admin) list", () => {
    expect(MANUAL_STATUSES).not.toContain("en_attente_paiement");
    expect(MANUAL_STATUSES).not.toContain("paiement_echoue");
    expect(MANUAL_STATUSES).toContain("expediee");
  });
});
