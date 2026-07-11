export type Stripe = "sable" | "rose";

export type Piece = {
  slug: string;
  nom: string;
  /** Sentence case; the collection cards uppercase it in CSS. */
  matiere: string;
  prix: number;
  phrase: string;
  /** Desktop gallery hang: column width in %, and how far the piece drops. */
  largeur: number;
  decalage: number;
  /**
   * Long-form copy. `specs` (dimensions, matières, délais) are commercial
   * claims: only Nour's come from the atelier. Don't invent the others.
   */
  sousTitre?: string;
  paragraphes?: string[];
  specs?: { label: string; valeur: string }[];
  photo?: { src: string; alt: string; cartel: string };
  vues?: { label: string; stripe: Stripe }[];
};

/**
 * Seed catalogue. This is what the store is initialised with the first time it
 * runs; after that, products live in `data/products.json` and are edited from
 * the backoffice. Read products through `lib/products.ts`, not from here.
 */
export const seedPieces: Piece[] = [
  {
    slug: "nour",
    nom: "Nour",
    matiere: "Cordon bordeaux + laiton",
    prix: 1480,
    phrase: "Une torsade continue, refermée sur elle-même.",
    largeur: 36,
    decalage: 0,
    sousTitre: "Cordon de coton tressé bordeaux · fermoir laiton brossé",
    paragraphes: [
      "Née d'un seul cordon, tressé à la main sans interruption. La torsade se referme sur elle-même, formant l'anse et le corps du sac en un geste continu, près de quatre jours de travail pour une seule pièce.",
      "La matière vieillit avec vous : le coton se patine, les fibres se resserrent à l'usage. Aucune pièce HYPA ne ressemble tout à fait à une autre.",
    ],
    specs: [
      { label: "Dimensions", valeur: "28 × 22 × 9 cm" },
      { label: "Matière", valeur: "Coton tressé, doublure lin" },
      { label: "Façonnage", valeur: "4 jours, une seule main" },
      { label: "Délai", valeur: "Expédiée sous 10 jours, écrin HYPA" },
    ],
    photo: {
      src: "/assets/cordon-macro.jpg",
      alt: "Macro du tressage de la pièce Nour",
      cartel: "Vue n°1 · le tressage, à hauteur de fibre.",
    },
    vues: [
      { label: "Vue · silhouette", stripe: "sable" },
      { label: "Vue · fermoir laiton", stripe: "rose" },
      { label: "Vue · porté épaule", stripe: "sable" },
    ],
  },
  {
    slug: "lueur",
    nom: "Lueur",
    matiere: "Cordon écru + laiton",
    prix: 980,
    phrase: "La lumière retenue dans un tressage clair.",
    largeur: 26,
    decalage: 70,
    paragraphes: [
      "L'écru ne cache rien. Chaque passage du cordon reste lisible, et le tressage s'y donne à voir comme une écriture claire, sans repentir possible.",
      "Le laiton brossé y répond en sourdine. Il retient la lumière plutôt qu'il ne la renvoie, et se patinera au rythme des mains qui le saisissent.",
    ],
  },
  {
    slug: "rive",
    nom: "Rive",
    matiere: "Tressage large, besace",
    prix: 1690,
    phrase: "Un cordon large, posé comme une berge.",
    largeur: 30,
    decalage: 16,
    paragraphes: [
      "Le cordon s'élargit, et le geste ralentit avec lui. Les torsades se posent les unes contre les autres sans se serrer, comme l'eau vient contre une berge.",
      "Portée en besace, la pièce trouve son aplomb contre le corps. Elle se creuse à l'usage, garde la trace de ce qu'on lui confie.",
    ],
  },
  {
    slug: "songe",
    nom: "Songe",
    matiere: "Mini sac, tressage rosé",
    prix: 860,
    phrase: "Petit format, tressage serré, presque secret.",
    largeur: 22,
    decalage: 96,
    paragraphes: [
      "Le petit format ne pardonne rien : à cette échelle, la moindre tension se voit. Le tressage s'y fait plus serré, plus lent, presque chuchoté.",
      "Le rosé n'est pas une couleur ajoutée mais une teinte tenue, qui s'adoucira sans jamais s'éteindre tout à fait.",
    ],
  },
  {
    slug: "trame",
    nom: "Trame",
    matiere: "Cabas, tressage double fil",
    prix: 1920,
    phrase: "Deux fils croisés, une seule respiration.",
    largeur: 34,
    decalage: 30,
    paragraphes: [
      "Deux fils avancent ensemble, croisés à chaque nœud. Ils ne se doublent pas : ils se répondent, et c'est de leur désaccord que naît la tenue du cabas.",
      "La pièce est faite pour être remplie. Elle s'ouvre, s'affaisse, se redresse, et la trame se resserre un peu plus à chaque fois.",
    ],
  },
  {
    slug: "echo",
    nom: "Écho",
    matiere: "Pochette fine bordeaux",
    prix: 720,
    phrase: "Le geste répété jusqu'au silence.",
    largeur: 24,
    decalage: 78,
    paragraphes: [
      "Une pochette n'a rien où se cacher. Le tressage y court d'un bord à l'autre sans interruption, et le geste s'y répète jusqu'à ne plus s'entendre.",
      "Le bordeaux profond absorbe la lumière. De loin, on ne voit qu'une surface ; de près, tout le relief du nœud.",
    ],
  },
  {
    slug: "aube",
    nom: "Aube",
    matiere: "Sac seau, tressage sable",
    prix: 1260,
    phrase: "Le sable du matin, noué à la main.",
    largeur: 30,
    decalage: 8,
    paragraphes: [
      "Le sac seau se construit en cercles. Le cordon monte en spirale depuis le fond, sans couture, jusqu'à ce que la forme se referme d'elle-même.",
      "La teinte sable garde quelque chose du petit matin : elle éclaircit à la lumière, se creuse à l'ombre, et change avec l'heure.",
    ],
  },
];
