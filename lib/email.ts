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
const BORDEAUX = "#632434";
const ENCRE = "#2A2320";

function shell(inner: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:32px 16px;background:${ECRU};font-family:Helvetica,Arial,sans-serif;color:${ENCRE};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <tr><td style="padding-bottom:24px;font-size:11px;letter-spacing:0.28em;color:${BORDEAUX};">HYPA</td></tr>
      ${inner}
      <tr><td style="padding-top:32px;border-top:1px solid rgba(42,35,32,0.15);font-size:11px;color:rgba(42,35,32,0.5);">
        © 2026 HYPA · Maroquinerie artisanale, Paris
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
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

export type OrderLine = { nom: string; qte: number; total: string };

export function orderConfirmationHtml(order: {
  orderNo: string;
  prenom: string;
  lines: OrderLine[];
  total: string;
}): string {
  const rows = order.lines
    .map(
      (line) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(42,35,32,0.12);font-size:15px;">
          ${escapeHtml(line.nom)} <span style="opacity:0.5;">× ${line.qte}</span>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid rgba(42,35,32,0.12);font-size:15px;color:${BORDEAUX};">
          ${escapeHtml(line.total)}
        </td>
      </tr>`,
    )
    .join("");

  return shell(`
    <tr><td style="font-size:34px;color:${BORDEAUX};padding-bottom:16px;">Merci, ${escapeHtml(order.prenom)}.</td></tr>
    <tr><td style="font-size:15px;line-height:1.8;opacity:0.75;padding-bottom:28px;">
      Votre pièce entre en préparation à l'atelier. Vous recevrez un suivi dès l'expédition.
    </td></tr>
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rows}
        <tr>
          <td style="padding:16px 0 0;font-size:17px;color:${BORDEAUX};">Total</td>
          <td align="right" style="padding:16px 0 0;font-size:17px;color:${BORDEAUX};">${escapeHtml(order.total)}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding-top:28px;font-size:12px;letter-spacing:0.14em;opacity:0.5;">
      COMMANDE N° ${escapeHtml(order.orderNo)}
    </td></tr>
  `);
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
    .map((line) => `<tr><td style="font-size:14px;padding:4px 0;">${escapeHtml(line.nom)} × ${line.qte}</td><td align="right" style="font-size:14px;">${escapeHtml(line.total)}</td></tr>`)
    .join("");

  return shell(`
    <tr><td style="font-size:28px;color:${BORDEAUX};padding-bottom:16px;">Nouvelle commande</td></tr>
    <tr><td style="font-size:14px;line-height:1.9;padding-bottom:20px;">
      <strong>${escapeHtml(order.prenom)} ${escapeHtml(order.nom)}</strong><br/>
      ${escapeHtml(order.email)}<br/>
      Commande n° ${escapeHtml(order.orderNo)}
    </td></tr>
    <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
      <tr><td style="padding-top:12px;border-top:1px solid rgba(42,35,32,0.15);font-size:16px;color:${BORDEAUX};">Total</td>
      <td align="right" style="padding-top:12px;border-top:1px solid rgba(42,35,32,0.15);font-size:16px;color:${BORDEAUX};">${escapeHtml(order.total)}</td></tr>
    </table></td></tr>
    <tr><td style="padding-top:24px;font-size:12px;opacity:0.55;line-height:1.7;">
      Aucun paiement n'a été encaissé : le site n'a pas de processeur de paiement branché.
    </td></tr>
  `);
}

export function subscriberAlertHtml(email: string): string {
  return shell(`
    <tr><td style="font-size:28px;color:${BORDEAUX};padding-bottom:16px;">Nouvel inscrit</td></tr>
    <tr><td style="font-size:15px;line-height:1.8;">${escapeHtml(email)}</td></tr>
  `);
}

export function welcomeHtml(): string {
  return shell(`
    <tr><td style="font-size:30px;color:${BORDEAUX};padding-bottom:16px;">Bienvenue.</td></tr>
    <tr><td style="font-size:15px;line-height:1.8;opacity:0.75;">
      Vous recevrez les nouvelles pièces en avant-première, à mesure qu'elles naissent à l'atelier.
      Une invitation, pas une lettre d'info.
    </td></tr>
  `);
}
