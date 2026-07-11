/**
 * French thousands grouping with a narrow no-break space (U+202F), done by hand
 * rather than via Intl so the server and client always emit identical markup.
 */
const NNBSP = " ";

/** `1480` -> `1 480 €` */
export function formatEuro(amount: number): string {
  const grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
  return `${grouped}${NNBSP}€`;
}
