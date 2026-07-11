import { NextResponse } from "next/server";
import {
  emailConfig,
  send,
  subscriberAlertHtml,
  welcomeHtml,
} from "@/lib/email";
import { allow, clientKey } from "@/lib/rate-limit";
import { addSubscriber } from "@/lib/subscribers";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  if (!allow(clientKey(request))) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const config = emailConfig();
  if (!config) {
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  const email =
    typeof body === "object" && body && "email" in body
      ? String((body as { email: unknown }).email).trim()
      : "";

  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  // Record first so the dashboard sees the subscriber even if Resend is down.
  // Best-effort: a read-only filesystem must not break the signup.
  try {
    await addSubscriber(email);
  } catch (error) {
    console.error("newsletter: could not persist subscriber —", error);
  }

  // The shop notification always goes to the account owner, so it works even
  // on the sandbox sender.
  const alert = await send(config, {
    to: config.shop,
    subject: `Nouvel inscrit — ${email}`,
    html: subscriberAlertHtml(email),
    replyTo: email,
  });

  if (!alert.ok) {
    console.error("newsletter: shop alert failed —", alert.error);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  // Resend refuses to deliver to third parties from onboarding@resend.dev, so
  // don't even try; say plainly that the subscriber got nothing.
  if (config.sandbox) {
    return NextResponse.json({ ok: true, welcomed: false, reason: "sandbox" });
  }

  const welcome = await send(config, {
    to: email,
    subject: "Bienvenue chez HYPA",
    html: welcomeHtml(),
  });

  if (!welcome.ok) {
    console.error("newsletter: welcome failed —", welcome.error);
  }
  return NextResponse.json({ ok: true, welcomed: welcome.ok });
}
