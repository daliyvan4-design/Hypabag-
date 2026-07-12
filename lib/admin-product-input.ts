import type { ProductInput } from "./products";

export type ParsedInput =
  | { ok: true; input: ProductInput }
  | { ok: false; error: string };

/** Validates and coerces a raw admin form/JSON body into a ProductInput. */
export function parseProductInput(body: unknown): ParsedInput {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "corps_invalide" };
  }
  const raw = body as Record<string, unknown>;

  const nom = String(raw.nom ?? "").trim();
  const matiere = String(raw.matiere ?? "").trim();
  const phrase = String(raw.phrase ?? "").trim();
  const prix = Number(raw.prix);
  const largeur = raw.largeur === undefined ? 30 : Number(raw.largeur);
  const decalage = raw.decalage === undefined ? 0 : Number(raw.decalage);
  const stock = raw.stock === undefined ? 1 : Number(raw.stock);

  if (!nom || nom.length > 80) return { ok: false, error: "nom_requis" };
  if (!matiere || matiere.length > 120) return { ok: false, error: "matiere_requise" };
  if (!phrase || phrase.length > 200) return { ok: false, error: "phrase_requise" };
  if (!Number.isFinite(prix) || prix < 0 || prix > 1_000_000) {
    return { ok: false, error: "prix_invalide" };
  }
  if (!Number.isFinite(largeur) || largeur < 15 || largeur > 100) {
    return { ok: false, error: "largeur_invalide" };
  }
  if (!Number.isFinite(decalage) || decalage < 0 || decalage > 200) {
    return { ok: false, error: "decalage_invalide" };
  }
  if (!Number.isFinite(stock) || stock < 0 || stock > 9999) {
    return { ok: false, error: "stock_invalide" };
  }

  const sousTitre = raw.sousTitre ? String(raw.sousTitre).trim() : undefined;

  const paragraphes = Array.isArray(raw.paragraphes)
    ? raw.paragraphes.map((p) => String(p))
    : typeof raw.paragraphes === "string"
      ? raw.paragraphes.split(/\n{2,}/)
      : undefined;

  let photo: ProductInput["photo"];
  if (raw.photo && typeof raw.photo === "object") {
    const p = raw.photo as Record<string, unknown>;
    const src = String(p.src ?? "").trim();
    if (src) {
      photo = {
        src,
        alt: String(p.alt ?? nom).trim(),
        cartel: String(p.cartel ?? "").trim(),
      };
    }
  }

  return {
    ok: true,
    input: { nom, matiere, phrase, prix, largeur, decalage, stock, sousTitre, paragraphes, photo },
  };
}
