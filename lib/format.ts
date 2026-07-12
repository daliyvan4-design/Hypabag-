/**
 * French thousands grouping with a narrow no-break space (U+202F), done by hand
 * rather than via Intl so the server and client always emit identical markup.
 */
const NNBSP = " ";

function group(amount: number): string {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
}

/** `1480` -> `1 480 €` */
export function formatEuro(amount: number): string {
  return `${group(amount)}${NNBSP}€`;
}

/** The CFA franc is fixed-pegged to the euro. This rate is legal, not a market. */
export const EUR_TO_XOF = 655.957;

/** Euro catalogue price -> integer XOF charged by Genius Pay (zero-decimal). */
export function eurToXof(euros: number): number {
  return Math.round(euros * EUR_TO_XOF);
}

/** `970816` -> `970 816 FCFA` */
export function formatXof(amount: number): string {
  return `${group(amount)}${NNBSP}FCFA`;
}
