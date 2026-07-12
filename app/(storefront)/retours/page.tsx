import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Retours",
  robots: { index: true, follow: true },
};

export default function Retours() {
  return (
    <LegalPage kicker="SERVICE" title="Retours" updated="12 juillet 2026">
      <p>
        Nous souhaitons que chaque pièce trouve sa juste place. Si ce
        n&apos;était pas le cas, un retour est possible dans les conditions
        ci-dessous.
      </p>

      <h2>Délai</h2>
      <p>
        Vous disposez d&apos;un délai de <strong>quatorze (14) jours</strong> à
        compter de la réception pour nous informer de votre souhait de retour,
        puis nous retourner la pièce.
      </p>

      <h2>Conditions</h2>
      <ul>
        <li>
          La pièce doit être retournée neuve, non portée, dans son écrin et avec
          ses éventuelles étiquettes.
        </li>
        <li>
          Les pièces personnalisées ou réalisées sur mesure ne sont pas
          reprises.
        </li>
        <li>
          La patine ou l&apos;usure résultant d&apos;un usage rendent le retour
          impossible.
        </li>
      </ul>

      <h2>Procédure</h2>
      <p>
        Écrivez à <Fill>[email de contact]</Fill> en indiquant votre numéro de
        commande. Nous vous communiquerons l&apos;adresse et les modalités de
        retour. <Fill>[Précisez ici qui prend en charge les frais de retour.]</Fill>
      </p>

      <h2>Remboursement</h2>
      <p>
        Après réception et vérification de la pièce, le remboursement est
        effectué sous <Fill>[délai, ex. 14 jours]</Fill>, par le même moyen de
        paiement que celui utilisé lors de l&apos;achat. Les frais de livraison
        initiaux, lorsqu&apos;ils existent, sont{" "}
        <Fill>[remboursés / non remboursés]</Fill>.
      </p>

      <h2>Échange</h2>
      <p>
        Chaque pièce étant unique, un échange n&apos;est pas toujours possible.
        Contactez-nous : nous chercherons la meilleure solution, selon les pièces
        alors disponibles à l&apos;atelier.
      </p>
    </LegalPage>
  );
}
