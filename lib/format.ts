/**
 * French thousands grouping with a narrow no-break space (U+202F), done by hand
 * rather than via Intl so the server and client always emit identical markup.
 * Prices are stored and charged in XOF (franc CFA), the shop's currency.
 * Defined by code point so the character can't be normalised to a plain space.
 */
const NNBSP = String.fromCharCode(0x202f);

function group(amount: number): string {
  return String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
}

/** `970000` -> `970 000 FCFA` */
export function formatXof(amount: number): string {
  return `${group(amount)}${NNBSP}FCFA`;
}
