import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Livraison",
  robots: { index: true, follow: true },
};

export default function Livraison() {
  return (
    <LegalPage kicker="SERVICE" title="Livraison" updated="12 juillet 2026">
      <p>
        Chaque pièce est vérifiée à la main puis expédiée sous écrin HYPA. Comme
        elle est façonnée à l&apos;unité, un court délai de préparation à
        l&apos;atelier précède l&apos;expédition.
      </p>

      <h2>Zones et délais</h2>
      <ul>
        <li>
          <strong>Abidjan</strong> — <Fill>[délai, ex. 2 à 3 jours ouvrés]</Fill>
        </li>
        <li>
          <strong>Reste de la Côte d&apos;Ivoire</strong> —{" "}
          <Fill>[délai]</Fill>
        </li>
        <li>
          <strong>International</strong> — <Fill>[délai / zones desservies]</Fill>
        </li>
      </ul>
      <p>
        Les délais courent à compter de la confirmation du paiement. Ils sont
        donnés à titre indicatif et peuvent varier selon la pièce et la
        destination.
      </p>

      <h2>Frais de livraison</h2>
      <p>
        La livraison est <strong>offerte</strong>, sous écrin HYPA. Toute
        évolution de cette politique sera indiquée avant la validation du
        paiement. <Fill>[Précisez ici d&apos;éventuels frais par zone.]</Fill>
      </p>

      <h2>Suivi</h2>
      <p>
        Dès l&apos;expédition, un numéro de suivi vous est communiqué. Vous
        pouvez consulter l&apos;état de votre commande à tout moment sur la page{" "}
        <a href="/suivi">Suivi de commande</a>, avec votre numéro de commande et
        l&apos;email utilisé lors de l&apos;achat.
      </p>

      <h2>Réception</h2>
      <p>
        À la réception, nous vous invitons à vérifier l&apos;état de la pièce. En
        cas d&apos;anomalie, contactez-nous sous 48 heures à{" "}
        <Fill>[email de contact]</Fill>.
      </p>
    </LegalPage>
  );
}
