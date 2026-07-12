import "server-only";

/** Overridable so tests can point at a local stub instead of delivering mail. */
const ENDPOINT = process.env.RESEND_ENDPOINT ?? "https://api.resend.com/emails";

export type EmailConfig = {
  apiKey: string;
  from: string;
  shop: string;
  /**
   * True while sending from Resend's shared onboarding@resend.dev address.
   * Resend then refuses to deliver to anyone but the account owner, so the
   * routes must not pretend a customer was emailed.
   */
  sandbox: boolean;
};

export function emailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const shop = process.env.RESEND_SHOP_EMAIL;
  if (!apiKey || !from || !shop) return null;
  return { apiKey, from, shop, sandbox: /@resend\.dev>?$/.test(from.trim()) };
}

type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function send(
  config: EmailConfig,
  message: { to: string; subject: string; html: string; replyTo?: string },
): Promise<SendResult> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });
  } catch (cause) {
    return { ok: false, error: `resend unreachable: ${String(cause)}` };
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      typeof body === "object" && body && "message" in body
        ? String((body as { message: unknown }).message)
        : `HTTP ${response.status}`;
    return { ok: false, error: detail };
  }
  return { ok: true, id: String((body as { id?: string })?.id ?? "") };
}

/* Templates ---------------------------------------------------------------- */

const ECRU = "#F4EEE4";
const CREME = "#EBE1CF";
const BORDEAUX = "#632434";
const ENCRE = "#2A2320";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
// e_trim strips the logo's near-white JPEG margin so it doesn't show a faint
// box on the white email card.
const LOGO = CLOUD
  ? `https://res.cloudinary.com/${CLOUD}/image/upload/e_trim:5,w_240,q_auto/hypa/hypa-logo-full.jpg`
  : "";

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hypa-one.vercel.app"
  ).replace(/\/$/, "");
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] as string,
  );
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
    <td align="center" bgcolor="${BORDEAUX}" style="border-radius:28px;">
      <a href="${href}" style="display:inline-block;padding:14px 32px;font-family:${SANS};font-size:13px;letter-spacing:0.05em;color:${ECRU};text-decoration:none;border-radius:28px;">${label}</a>
    </td>
  </tr></table>`;
}

/** Outer card with the wordmark header and the maison footer. */
function shell(opts: {
  preheader: string;
  inner: string;
  align?: string;
}): string {
  const align = opts.align ?? "left";
  const header = LOGO
    ? `<img src="${LOGO}" width="120" alt="HYPA" style="display:block;margin:0 auto;border:0;" />`
    : `<div style="font-family:${SERIF};font-size:26px;letter-spacing:0.02em;color:${BORDEAUX};text-align:center;">HYPA</div>`;

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${ECRU};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ECRU};padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid rgba(99,36,52,0.12);border-radius:18px;">
        <tr><td style="padding:36px 44px 8px;">${header}</td></tr>
        <tr><td style="padding:0 44px;"><div style="height:1px;background:rgba(42,35,32,0.1);"></div></td></tr>
        <tr><td style="padding:30px 44px 8px;font-family:${SANS};color:${ENCRE};text-align:${align};">${opts.inner}</td></tr>
        <tr><td style="padding:28px 44px 34px;">
          <div style="height:1px;background:rgba(42,35,32,0.1);margin-bottom:18px;"></div>
          <div style="font-family:${SANS};font-size:11px;line-height:1.7;color:rgba(42,35,32,0.5);text-align:center;">
            HYPA · Maroquinerie artisanale, Paris<br/>
            Chaque pièce est tissée à la main, à partir d'un unique cordon.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export type OrderLine = { nom: string; qte: number; total: string };

export function orderConfirmationHtml(order: {
  orderNo: string;
  prenom: string;
  email: string;
  lines: OrderLine[];
  total: string;
}): string {
  const rows = order.lines
    .map(
      (line) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(42,35,32,0.1);font-family:${SERIF};font-size:16px;color:${ENCRE};">
          ${escapeHtml(line.nom)} <span style="font-family:${SANS};font-size:13px;color:rgba(42,35,32,0.5);">× ${line.qte}</span>
        </td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(42,35,32,0.1);font-family:${SERIF};font-size:15px;color:${BORDEAUX};">
          ${escapeHtml(line.total)}
        </td>
      </tr>`,
    )
    .join("");

  const track = `${siteUrl()}/suivi?no=${encodeURIComponent(order.orderNo)}`;

  return shell({
    preheader: `Merci ${order.prenom} — votre commande ${order.orderNo} est confirmée.`,
    inner: `
      <div style="font-size:11px;letter-spacing:0.24em;color:${BORDEAUX};margin-bottom:14px;">COMMANDE CONFIRMÉE</div>
      <div style="font-family:${SERIF};font-size:32px;color:${BORDEAUX};margin-bottom:16px;">Merci, ${escapeHtml(order.prenom)}.</div>
      <p style="font-size:15px;line-height:1.8;color:rgba(42,35,32,0.75);margin:0 0 26px;">
        Votre pièce entre en préparation à l'atelier. Chaque nœud est vérifié à la main
        avant l'expédition, sous écrin HYPA. Vous recevrez un suivi dès qu'elle prend la route.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rows}
        <tr>
          <td style="padding:18px 0 0;font-family:${SERIF};font-size:19px;color:${BORDEAUX};">Total</td>
          <td align="right" style="padding:18px 0 0;font-family:${SERIF};font-size:19px;color:${BORDEAUX};">${escapeHtml(order.total)}</td>
        </tr>
      </table>
      <div style="margin:30px 0 8px;">${button(track, "Suivre ma commande")}</div>
      <div style="text-align:center;font-size:12px;letter-spacing:0.14em;color:rgba(42,35,32,0.5);margin-top:20px;">
        COMMANDE N° ${escapeHtml(order.orderNo)}
      </div>`,
  });
}

export function orderAlertHtml(order: {
  orderNo: string;
  prenom: string;
  nom: string;
  email: string;
  lines: OrderLine[];
  total: string;
}): string {
  const rows = order.lines
    .map(
      (line) =>
        `<tr><td style="font-family:${SANS};font-size:14px;padding:6px 0;color:${ENCRE};">${escapeHtml(line.nom)} × ${line.qte}</td><td align="right" style="font-family:${SANS};font-size:14px;padding:6px 0;color:${BORDEAUX};">${escapeHtml(line.total)}</td></tr>`,
    )
    .join("");

  return shell({
    preheader: `Nouvelle commande ${order.orderNo} — ${order.total}`,
    inner: `
      <div style="font-size:11px;letter-spacing:0.24em;color:${BORDEAUX};margin-bottom:14px;">NOUVELLE COMMANDE</div>
      <div style="background:${CREME};border-radius:12px;padding:18px 20px;font-family:${SANS};font-size:14px;line-height:1.9;color:${ENCRE};margin-bottom:22px;">
        <strong>${escapeHtml(order.prenom)} ${escapeHtml(order.nom)}</strong><br/>
        <a href="mailto:${escapeHtml(order.email)}" style="color:${BORDEAUX};text-decoration:none;">${escapeHtml(order.email)}</a><br/>
        Commande n° ${escapeHtml(order.orderNo)}
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
        <tr><td style="padding-top:14px;border-top:1px solid rgba(42,35,32,0.15);font-family:${SERIF};font-size:17px;color:${BORDEAUX};">Total</td>
        <td align="right" style="padding-top:14px;border-top:1px solid rgba(42,35,32,0.15);font-family:${SERIF};font-size:17px;color:${BORDEAUX};">${escapeHtml(order.total)}</td></tr>
      </table>
      <p style="font-size:12px;line-height:1.7;color:rgba(42,35,32,0.55);margin:22px 0 0;">
        Le stock des pièces a été décrémenté. Aucun paiement n'a été encaissé :
        aucun processeur de paiement n'est branché.
      </p>`,
  });
}

export function subscriberAlertHtml(email: string): string {
  return shell({
    preheader: `Nouvel inscrit : ${email}`,
    inner: `
      <div style="font-size:11px;letter-spacing:0.24em;color:${BORDEAUX};margin-bottom:14px;">NOUVEL INSCRIT</div>
      <div style="font-family:${SERIF};font-size:24px;color:${BORDEAUX};margin-bottom:10px;">Une nouvelle adresse.</div>
      <p style="font-size:15px;line-height:1.8;color:${ENCRE};margin:0;">
        <a href="mailto:${escapeHtml(email)}" style="color:${BORDEAUX};text-decoration:none;">${escapeHtml(email)}</a>
      </p>`,
  });
}

export function welcomeHtml(): string {
  return shell({
    align: "center",
    preheader: "Bienvenue chez HYPA — une invitation, pas une lettre d'info.",
    inner: `
      <div style="font-size:11px;letter-spacing:0.24em;color:${BORDEAUX};margin-bottom:14px;">RESTER PROCHE</div>
      <div style="font-family:${SERIF};font-size:32px;color:${BORDEAUX};margin-bottom:16px;">Bienvenue.</div>
      <p style="font-size:15px;line-height:1.85;color:rgba(42,35,32,0.75);margin:0 0 28px;">
        Vous recevrez les nouvelles pièces en avant-première, à mesure qu'elles
        naissent à l'atelier. Une invitation, pas une lettre d'info.
      </p>
      ${button(`${siteUrl()}/collection`, "Découvrir la collection")}`,
  });
}
