import { NextResponse } from "next/server";
import { expireStalePendingOrders } from "@/lib/expire";

/**
 * Scheduled by vercel.json. Vercel signs cron requests with the project's
 * CRON_SECRET as a bearer token; reject anything else so the endpoint can't be
 * triggered from outside.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const released = await expireStalePendingOrders();
  return NextResponse.json({ ok: true, released });
}
