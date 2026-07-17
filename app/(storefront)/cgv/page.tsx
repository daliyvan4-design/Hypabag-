import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  robots: { index: true, follow: true },
};

export default function CGV() {
  return (
    <LegalPage
      kicker="CGV"
      title={
        <>
          Conditions générales
          <br />
          de vente
        </>
      }
      updated="12 juillet 2026"
    >
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent les ventes de pièces de maroquinerie
        artisanale conclues sur le site HYPA entre <Fill>[RAISON SOCIALE]</Fill>{" "}
        (« la Maison ») et toute personne effectuant un achat (« le Client »).
        Toute commande implique l&apos;acceptation sans réserve des présentes
        conditions.
      </p>

      <h2>2. Produits</h2>
      <p>
        Chaque pièce est tissée à la main à partir d&apos;un unique cordon de
        coton tressé. Les pièces étant façonnées individuellement, aucune
        n&apos;est strictement identique à une autre : les variations de teinte,
        de tension et de tressage sont une caractéristique du produit. Les
        visuels sont les plus fidèles possibles mais ne sauraient engager la
        Maison en cas de différence mineure de rendu à l&apos;écran.
      </p>

      <h2>3. Prix</h2>
      <p>
        Les prix sont indiqués en francs CFA (FCFA), toutes taxes comprises. La
        Maison se réserve le droit de modifier ses prix à tout moment ; les
        pièces sont facturées sur la base du tarif en vigueur au moment de la
        validation de la commande. Les éventuels frais de livraison sont
        précisés avant la validation du paiement.
      </p>

      <h2>4. Commande</h2>
      <p>
        La commande est validée après confirmation du panier, saisie des
        coordonnées et du paiement. Chaque pièce étant unique, sa disponibilité
        est vérifiée au moment de la commande ; une pièce épuisée ne peut être
        commandée. Un numéro de commande (format HY-000000) est attribué et
        permet le suivi.
      </p>

      <h2>5. Paiement</h2>
      <p>
        Le paiement est opéré via <strong>Genius Pay</strong>{" "}
        (<a href="https://pay.genius.ci">pay.genius.ci</a>), qui prend en charge
        les moyens de paiement mobiles (Wave, Orange Money, MTN Money) et par
        carte. Le paiement s&apos;effectue sur la page sécurisée de Genius Pay :
        la Maison n&apos;a jamais accès aux données de paiement du Client. La
        commande n&apos;est confirmée qu&apos;après validation du paiement par
        Genius Pay.
      </p>

      <h2>6. Livraison</h2>
      <p>
        Les modalités, zones et délais de livraison sont détaillés sur la page{" "}
        <a href="/livraison">Livraison</a>. Le suivi de commande est accessible
        sur la page <a href="/suivi">Suivi de commande</a>.
      </p>

      <h2>7. Droit de rétractation et retours</h2>
      <p>
        Le Client dispose d&apos;un délai de quatorze (14) jours à compter de la
        réception pour retourner une pièce, dans les conditions décrites sur la
        page <a href="/retours">Retours</a>. Les pièces personnalisées ou
        réalisées sur mesure ne sont pas éligibles au retour.
      </p>

      <h2>8. Garanties</h2>
      <p>
        Les pièces bénéficient des garanties légales de conformité et contre les
        vices cachés. La garantie ne couvre pas l&apos;usure normale, la patine
        naturelle des matières, ni les dommages résultant d&apos;un usage non
        conforme.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Les traitements de données sont décrits dans la{" "}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>10. Droit applicable et litiges</h2>
      <p>
        Les présentes conditions sont soumises au droit ivoirien. En cas de
        litige, une solution amiable sera recherchée avant toute action ; à
        défaut, compétence est attribuée aux tribunaux d&apos;Abidjan.{" "}
        <Fill>[À adapter si la Maison relève d&apos;une autre juridiction.]</Fill>
      </p>
    </LegalPage>
  );
}
