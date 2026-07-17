import { createHmac } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

const SECRET = "whsec_test_secret";
let verifyWebhook: typeof import("@/lib/genius-pay").verifyWebhook;

beforeAll(async () => {
  // The module reads the secret at load time, so set it before importing.
  process.env.GENIUS_PAY_WEBHOOK_SECRET = SECRET;
  ({ verifyWebhook } = await import("@/lib/genius-pay"));
});

function sign(ts: string, body: string): string {
  return createHmac("sha256", SECRET).update(`${ts}.${body}`).digest("hex");
}

const body = JSON.stringify({
  id: "evt_1",
  event: "payment.success",
  timestamp: 1,
  data: { reference: "MTX-1", amount: 970000, status: "completed", metadata: { orderNo: "HY-123456" } },
  environment: "live",
});

describe("verifyWebhook", () => {
  it("accepts a correctly signed, fresh payload", () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const payload = verifyWebhook(body, sign(ts, body), ts);
    expect(payload?.data.metadata?.orderNo).toBe("HY-123456");
  });

  it("rejects a bad signature", () => {
    const ts = String(Math.floor(Date.now() / 1000));
    expect(verifyWebhook(body, sign(ts, body).replace(/.$/, "0"), ts)).toBeNull();
  });

  it("rejects a tampered body", () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const good = sign(ts, body);
    expect(verifyWebhook(body.replace("970000", "1"), good, ts)).toBeNull();
  });

  it("rejects a stale timestamp (replay)", () => {
    const old = String(Math.floor(Date.now() / 1000) - 600);
    expect(verifyWebhook(body, sign(old, body), old)).toBeNull();
  });

  it("rejects missing headers", () => {
    expect(verifyWebhook(body, null, null)).toBeNull();
  });
});
