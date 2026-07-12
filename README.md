# HYPA

Boutique en ligne d'une maison de maroquinerie artisanale. Porté depuis la
maquette Claude Design `HYPA.dc.html` vers Next.js (App Router, TypeScript,
CSS Modules).

```bash
pnpm install
cp .env.example .env.local   # renseigner Cloudinary + Resend
pnpm dev
```

## Configuration (`.env.local`)

| Variable                             | Rôle                                                     |
| ------------------------------------ | -------------------------------------------------------- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  | Vide = images servies depuis `public/assets`. Renseigné = via Cloudinary (assets déjà téléversés). |
| `CLOUDINARY_API_KEY` / `_API_SECRET` | Requis uniquement pour `pnpm media:upload`.              |
| `RESEND_API_KEY`                     | Sans elle, les formulaires répondent 503.               |
| `RESEND_FROM`                        | Expéditeur. `onboarding@resend.dev` = mode bac à sable.  |
| `RESEND_SHOP_EMAIL`                  | Destinataire des alertes commande / inscription.        |
| `ADMIN_PASSWORD`                     | Mot de passe du backoffice `/admin`.                    |
| `ADMIN_SESSION_SECRET`               | Secret de signature des sessions admin (chaîne aléatoire longue). |

**Mode bac à sable :** tant que `RESEND_FROM` reste `onboarding@resend.dev`,
Resend ne délivre qu'à `RESEND_SHOP_EMAIL`. Le client ne reçoit donc rien, et le
site le dit — la page de confirmation adapte son texte (`lastOrder.emailed`).
Basculer sur `bonjour@votredomaine.fr` une fois le domaine vérifié.

## Backoffice (`/admin`)

Espace de gestion protégé par mot de passe (`ADMIN_PASSWORD`), session signée en
cookie HttpOnly. Quatre espaces :

- **Tableau de bord** — CA, commandes, inscrits, pièces ; graphique du CA par
  jour avec sélecteur de période (7 j / 30 j / tout).
- **Produits** — création, édition, suppression des pièces (photo Cloudinary,
  **stock**). Toute modification se reflète immédiatement sur le site ; à 0 la
  pièce passe « Épuisé » et n'est plus commandable.
- **Média & vidéos** — upload des vidéos héros et de transition vers Cloudinary.
- **Commandes** — historique, inscrits, et **suivi** : statut (en préparation /
  expédiée / livrée / annulée) et numéro de suivi par commande.

## Paiement (Genius Pay)

Passerelle ivoirienne [pay.genius.ci](https://pay.genius.ci/doc), débit en XOF.

- Au checkout, le serveur ([app/api/checkout](app/api/checkout/route.ts)) réserve
  le stock, enregistre une commande « en attente de paiement », crée la
  transaction Genius Pay et renvoie le `checkout_url` ; le client est redirigé
  vers la page de paiement hébergée (Wave, Orange Money, MTN, carte).
- Le montant est converti EUR→XOF au **taux fixe légal du franc CFA** (1 € =
  655,957 FCFA, voir [lib/format.ts](lib/format.ts)). Le catalogue reste en euros.
- Le **webhook** ([app/api/webhooks/genius-pay](app/api/webhooks/genius-pay/route.ts))
  est la source de vérité : signature HMAC-SHA256 vérifiée (fenêtre anti-rejeu
  5 min), puis la commande est validée (payée → en préparation, emails envoyés)
  de façon idempotente, ou le stock est relâché en cas d'échec.
- Variables : `GENIUS_PAY_API_KEY`, `GENIUS_PAY_API_SECRET`,
  `GENIUS_PAY_WEBHOOK_SECRET` (optionnel, défaut = API secret), `GENIUS_PAY_BASE`
  (optionnel), `NEXT_PUBLIC_SITE_URL`.
- **URL de webhook à enregistrer** dans le dashboard Genius Pay :
  `https://hypa-one.vercel.app/api/webhooks/genius-pay`.

## Stock & suivi de commande

- Chaque pièce a un `stock`. `/api/orders` réserve le stock de façon atomique
  (verrou de ligne) avant de confirmer ; une pièce épuisée renvoie 409.
- Les clients suivent leur commande sur **/suivi** (numéro + email, l'email doit
  correspondre pour éviter l'énumération). Le lien est aussi dans l'email de
  confirmation.
- Les emails (commande, alerte atelier, bienvenue, inscription) sont des
  gabarits HTML de marque dans [lib/email.ts](lib/email.ts).
- Un **pop-up newsletter** s'affiche sur l'accueil au bout de 10 s, deux fois au
  plus (compteur `localStorage`), jamais après inscription.
- Le **garde-fou anti-abus** ([lib/rate-limit.ts](lib/rate-limit.ts)) est
  adossé à Postgres (partagé entre instances) ; repli mémoire en local.

## Persistance

Toutes les données (produits, commandes, inscrits, réglages) passent par
[lib/store.ts](lib/store.ts) — le **seul** module qui connaît l'emplacement des
données. Il stocke chaque « collection » comme un document et choisit son
backend automatiquement :

- **Postgres** dès qu'une chaîne de connexion est présente (`POSTGRES_URL` ou
  `DATABASE_URL`) — c'est le cas en production. Une table JSONB `store(key, value)`,
  mutations sous verrou de ligne (`SELECT … FOR UPDATE`) pour rester correct en
  multi-instances. Backend : [lib/store-postgres.ts](lib/store-postgres.ts),
  pool : [lib/db.ts](lib/db.ts).
- **Fichiers JSON** sous `data/` sinon — pour le développement local, sans base à
  installer. Backend : [lib/store-file.ts](lib/store-file.ts).

Les produits sont initialisés depuis `seedPieces`
([lib/pieces.ts](lib/pieces.ts)) au premier accès. En production, la base Neon
est provisionnée via le Vercel Marketplace (intégration Neon), qui injecte
`POSTGRES_URL` dans le projet. Le dossier `data/` est gitignoré.

## Médias

Les images passent par un loader `next/image` custom
([lib/cloudinary-loader.ts](lib/cloudinary-loader.ts)) : `f_auto,q_auto` négocie
WebP/AVIF au vol, aussi bien pour les assets seed (`/assets/*`) que pour les
photos produit téléversées depuis le backoffice. `pnpm media:upload` pousse les
images de `public/assets` vers Cloudinary (dossier `hypa/`). Les vidéos héros et
de transition sont téléversées depuis le backoffice et référencées dans
`data/site.json`.

## Structure

| Route                | Page                                              |
| -------------------- | ------------------------------------------------- |
| `/`                  | Accueil — héros, manifeste, trois portes d'entrée  |
| `/collection`        | Les sept pièces, accrochées en quinconce           |
| `/collection/[slug]` | Fiche pièce                                        |
| `/atelier`           | Le récit du fait main                              |
| `/panier`            | Panier                                             |
| `/checkout`          | Coordonnées, livraison, paiement                   |
| `/confirmation`      | Commande confirmée                                 |

- `lib/products.ts` — lecture/écriture du catalogue (store fichier, initialisé
  depuis `lib/pieces.ts`). **Les prix ne viennent que d'ici :** `/api/orders`
  recalcule chaque total à partir du slug, jamais depuis le corps de la requête,
  pour qu'un client ne puisse pas se faire confirmer une commande à un faux prix.
- `lib/cart.tsx` — panier hors React (`useSyncExternalStore`), persisté dans
  `localStorage`, lu de façon synchrone au premier rendu client.
- `lib/email.ts` — envoi Resend + gabarits HTML. `RESEND_ENDPOINT` est
  surchargeable pour tester sans expédier.
- `lib/rate-limit.ts` — garde-fou mémoire (5 req / 10 min) sur les deux routes
  qui déclenchent un envoi. À remplacer par un store partagé (Upstash/KV) avant
  du vrai trafic.
- `app/api/orders`, `app/api/newsletter` — routes serveur.
- `components/ui.module.css` — les briques partagées (boutons, totaux, étapes).
- `components/transition-curtain.tsx` — le rideau de marque entre les pages.

## Écarts assumés par rapport à la maquette

La maquette est une démo interactive ; certaines de ses béquilles n'ont pas leur
place dans un site réel :

- **Le bouton « Mobile / Bureau » et le cadre de téléphone** ont disparu au
  profit de vraies media queries (point de bascule : 860 px).
- **Le panier démarre vide.** La maquette le pré-remplissait de deux pièces.
- **Le panneau plein écran** (`menuOverlay`) et l'observateur `[data-reveal]`
  n'étaient reliés à aucun déclencheur : non portés.
- **Chaque page a sa propre URL** au lieu d'un `state.page`, et la fiche `Nour`
  est devenue `/collection/[slug]`, servie pour les sept pièces.
- **Le rideau de transition** ne s'affiche pas sur `/panier`, `/checkout` et
  `/confirmation`, et jamais si `prefers-reduced-motion` est actif. Ses durées
  sont deux constantes en tête de `components/transition-curtain.tsx`.

## À finir

- **Vidéo de transition** : `public/assets/loading.mp4` (le logo HYPA en
  rotation 3D) est en place, téléversée sur Cloudinary (`hypa/loading`) et servie
  en `q_auto`. C'est le loader par défaut entre les pages
  ([lib/media.ts](lib/media.ts), `LOADER_VIDEO_DEFAULT`).
- **Vidéo héros** (fond d'accueil) : optionnelle, à téléverser via **/admin →
  Média & vidéos** si souhaité ; sans elle, le héros garde son image d'affiche.
  Toute vidéo téléversée depuis le backoffice remplace le défaut.
- **Domaine email à vérifier.** Tant que `RESEND_FROM` reste le bac à sable, les
  clients ne reçoivent pas leur confirmation (seul `RESEND_SHOP_EMAIL` est
  servi). Acheter + vérifier un domaine chez Resend, puis changer `RESEND_FROM`.
- **Six pièces sur sept n'ont pas de spécifications.** Elles ont désormais leur
  prose descriptive, mais dimensions / matières / délais restent vides : ce sont
  des affirmations commerciales, à remplir dans `lib/pieces.ts` par l'atelier.
- **Les bandes rayées** tiennent lieu de photographies produit.
- **Pages légales** (CGV, mentions légales, RGPD, livraison, retours) à écrire.
