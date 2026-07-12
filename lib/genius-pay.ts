import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Genius Pay merchant API (pay.genius.ci). Payment creation is entirely
 * server-side — the public key is sent as X-API-Key but, like the secret,
 * never reaches the browser. See https://pay.genius.ci/doc.
 */
const BASE = (
  process.env.GENIUS_PAY_BASE ?? "https://pay.genius.ci/api/v1/merchant"
).replace(/\/$/, "");
const API_KEY = process.env.GENIUS_PAY_API_KEY ?? "";
const API_SECRET = process.env.GENIUS_PAY_API_SECRET ?? "";
// The dashboard may show a dedicated webhook secret; fall back to the API secret.
const WEBHOOK_SECRET = process.env.GENIUS_PAY_WEBHOOK_SECRET || API_SECRET;

const REPLAY_WINDOW_MS = 5 * 60 * 1000;

export function geniusPayConfigured(): boolean {
  return Boolean(API_KEY && API_SECRET);
}

export type CreatePaymentInput = {
  /** Integer amount in the smallest unit of `currency` (XOF is zero-decimal). */
  amount: number;
  currency: "XOF" | "EUR" | "USD";
  customer: { phone: string; name?: string; email?: string };
  description?: string;
  successUrl: string;
  errorUrl: string;
  metadata?: Record<string, string>;
};

export type CreatePaymentResult =
  | { ok: true; checkoutUrl: string; reference: string }
  | { ok: false; error: string };

export async function createPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  if (!geniusPayConfigured()) {
    return { ok: false, error: "genius_pay_not_configured" };
  }

  let response: Response;
  try {
    response = await fetch(`${BASE}/payments`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "X-API-Secret": API_SECRET,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amount,
        currency: input.currency,
        customer: input.customer,
        description: input.description,
        success_url: input.successUrl,
        error_url: input.errorUrl,
        metadata: input.metadata,
      }),
    });
  } catch (cause) {
    return { ok: false, error: `genius_pay_unreachable: ${String(cause)}` };
  }

  const body: Record<string, unknown> = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const detail =
      (body.message as string | undefined) ??
      (body.error as string | undefined) ??
      `HTTP ${response.status}`;
    return { ok: false, error: detail };
  }

  const checkoutUrl = (body.checkout_url ?? body.payment_url) as
    | string
    | undefined;
  const reference = body.reference as string | undefined;
  if (!checkoutUrl || !reference) {
    return { ok: false, error: "genius_pay_bad_response" };
  }
  return { ok: true, checkoutUrl, reference };
}

/**
 * Verify a webhook against its signature header.
 * signature = HMAC-SHA256(`${timestamp}.${rawBody}`, secret), hex.
 * Returns the parsed payload only when the signature and 5-minute window pass.
 */
export type WebhookPayload = {
  id: string;
  event: string;
  timestamp: number;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: Record<string, string>;
  };
  environment: string;
};

export function verifyWebhook(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
): WebhookPayload | null {
  if (!signature || !timestamp || !WEBHOOK_SECRET) return null;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return null;
  // Timestamp may be seconds or milliseconds; normalise to ms.
  const tsMs = ts < 1e12 ? ts * 1000 : ts;
  if (Math.abs(Date.now() - tsMs) > REPLAY_WINDOW_MS) return null;

  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature.trim(), "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return null;
  }
}
