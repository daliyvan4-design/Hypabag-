import { cookies } from "next/headers";

/**
 * Single-admin session. A signed, expiring token in an HttpOnly cookie — no
 * accounts table, no external provider. Verification uses Web Crypto so the
 * same code runs in middleware and in route handlers.
 *
 * The password and signing secret come from the environment; with either
 * unset, `configured()` is false and the whole backoffice refuses to unlock.
 */
export const SESSION_COOKIE = "hypa_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

export function configured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

async function hmac(payload: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(payload),
  );
  return toBase64Url(new Uint8Array(signature));
}

/** Constant-time-ish string compare, to avoid leaking match length by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createToken(): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = toBase64Url(new TextEncoder().encode(String(expires)));
  const signature = await hmac(payload, key);
  return `${payload}.${signature}`;
}

export async function verifyToken(
  token: string | undefined,
): Promise<boolean> {
  const key = secret();
  if (!key || !token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await hmac(payload, key);
  if (!safeEqual(signature, expected)) return false;

  const expires = Number(Buffer.from(payload, "base64url").toString("utf8"));
  return Number.isFinite(expires) && expires > Date.now();
}

export function verifyPassword(candidate: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  // Normalise so an accented character (é) typed as a combining sequence still
  // matches the stored precomposed form.
  return safeEqual(candidate.normalize("NFC"), password.normalize("NFC"));
}

/** True if the current request carries a valid admin session. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

export { SESSION_TTL_MS };
