import "server-only";
import { mutateCollection, readCollection, writeCollection } from "./store";
import { seedPieces, type Piece } from "./pieces";

const COLLECTION = "products";

/** Reads the catalogue, seeding the store from `seedPieces` on first access. */
export async function getProducts(): Promise<Piece[]> {
  const stored = await readCollection<Piece[] | null>(COLLECTION, null);
  if (stored && stored.length > 0) return stored;
  // Best-effort seed. On a read-only filesystem (e.g. Vercel serverless) the
  // write throws — the storefront must still render, so fall back to the seed
  // in memory rather than crashing the page.
  try {
    await writeCollection(COLLECTION, seedPieces);
  } catch (error) {
    console.warn("products: could not persist seed (read-only fs?)", error);
  }
  return seedPieces;
}

export async function getProduct(slug: string): Promise<Piece | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

/** `nour` -> `01`, matching the "Pièce n°01" cartel. Reflects store order. */
export async function getProductNumero(slug: string): Promise<string> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.slug === slug);
  return String(index + 1).padStart(2, "0");
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export type ProductInput = {
  nom: string;
  matiere: string;
  prix: number;
  largeur: number;
  decalage: number;
  stock: number;
  phrase: string;
  sousTitre?: string;
  paragraphes?: string[];
  photo?: { src: string; alt: string; cartel: string };
};

export type SaveResult =
  | { ok: true; product: Piece }
  | { ok: false; error: string };

export async function createProduct(input: ProductInput): Promise<SaveResult> {
  const products = await getProducts();

  const base = slugify(input.nom);
  if (!base) return { ok: false, error: "nom_invalide" };

  // Keep slugs unique so URLs and store lookups stay stable.
  let slug = base;
  for (let n = 2; products.some((p) => p.slug === slug); n += 1) {
    slug = `${base}-${n}`;
  }

  const product: Piece = { slug, ...normalise(input) };
  await writeCollection(COLLECTION, [...products, product]);
  return { ok: true, product };
}

export async function updateProduct(
  slug: string,
  input: ProductInput,
): Promise<SaveResult> {
  const products = await getProducts();
  const existing = products.find((p) => p.slug === slug);
  if (!existing) return { ok: false, error: "introuvable" };

  const product: Piece = { ...existing, ...normalise(input), slug };
  await writeCollection(
    COLLECTION,
    products.map((p) => (p.slug === slug ? product : p)),
  );
  return { ok: true, product };
}

export async function deleteProduct(slug: string): Promise<boolean> {
  let removed = false;
  await mutateCollection<Piece[]>(COLLECTION, seedPieces, (current) => {
    const next = current.filter((p) => p.slug !== slug);
    removed = next.length !== current.length;
    return next;
  });
  return removed;
}

/** Strips empty optional fields so the JSON stays clean. */
function normalise(input: ProductInput): Omit<Piece, "slug"> {
  const paragraphes = (input.paragraphes ?? [])
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    nom: input.nom.trim(),
    matiere: input.matiere.trim(),
    prix: Math.round(input.prix),
    phrase: input.phrase.trim(),
    largeur: input.largeur,
    decalage: input.decalage,
    stock: Math.max(0, Math.round(input.stock)),
    ...(input.sousTitre?.trim() ? { sousTitre: input.sousTitre.trim() } : {}),
    ...(paragraphes.length ? { paragraphes } : {}),
    ...(input.photo?.src ? { photo: input.photo } : {}),
  };
}

export type StockResult =
  | { ok: true }
  | { ok: false; error: "rupture"; slug: string };

/**
 * Atomically verify and decrement stock for an order's lines. Runs the whole
 * check-and-decrement inside one locked read-modify-write so two buyers can't
 * both claim the last piece. Untracked stock (undefined) is left alone.
 */
export async function reserveStock(
  lines: { slug: string; qte: number }[],
): Promise<StockResult> {
  let result: StockResult = { ok: true };
  await mutateCollection<Piece[]>(COLLECTION, seedPieces, (current) => {
    result = { ok: true };
    for (const line of lines) {
      const piece = current.find((p) => p.slug === line.slug);
      if (piece && typeof piece.stock === "number" && piece.stock < line.qte) {
        result = { ok: false, error: "rupture", slug: line.slug };
        return current; // no change
      }
    }
    return current.map((piece) => {
      const line = lines.find((l) => l.slug === piece.slug);
      if (!line || typeof piece.stock !== "number") return piece;
      return { ...piece, stock: Math.max(0, piece.stock - line.qte) };
    });
  });
  return result;
}

/** Give reserved stock back when a payment fails, is cancelled, or expires. */
export async function releaseStock(
  lines: { slug: string; qte: number }[],
): Promise<void> {
  await mutateCollection<Piece[]>(COLLECTION, seedPieces, (current) =>
    current.map((piece) => {
      const line = lines.find((l) => l.slug === piece.slug);
      if (!line || typeof piece.stock !== "number") return piece;
      return { ...piece, stock: piece.stock + line.qte };
    }),
  );
}
