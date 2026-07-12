import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  configured,
  createToken,
  verifyPassword,
} from "@/lib/admin-auth";
import { allow, clientKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!configured()) {
    return NextResponse.json({ error: "admin_not_configured" }, { status: 503 });
  }
  // Throttle password guessing per client.
  if (!(await allow(`login:${clientKey(request)}`))) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const body: unknown = await request.json().catch(() => null);
  const password =
    typeof body === "object" && body && "password" in body
      ? String((body as { password: unknown }).password)
      : "";

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  const token = await createToken();
  if (!token) {
    return NextResponse.json({ error: "admin_not_configured" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  return response;
}
