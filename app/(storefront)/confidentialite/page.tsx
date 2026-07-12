import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: true, follow: true },
};

export default function Confidentialite() {
  return (
    <LegalPage
      kicker="RGPD"
      title={
        <>
          Politique de
          <br />
          confidentialité
        </>
      }
      updated="12 juillet 2026"
    >
      <p>
        La Maison <Fill>[RAISON SOCIALE]</Fill> attache une grande importance à
        la protection des données personnelles de ses clients. La présente
        politique décrit les données collectées, leurs finalités et les droits
        dont vous disposez, conformément au Règlement général sur la protection
        des données (RGPD) et aux dispositions applicables.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        Le responsable du traitement est <Fill>[RAISON SOCIALE]</Fill>,{" "}
        <Fill>[adresse]</Fill>. Contact :{" "}
        <Fill>[email de contact / DPO]</Fill>.
      </p>

      <h2>Données collectées et finalités</h2>
      <ul>
        <li>
          <strong>Commande</strong> — nom, prénom, adresse email, téléphone,
          adresse de livraison. Finalité : traiter et livrer la commande,
          permettre le suivi et le service client. Base légale : exécution du
          contrat.
        </li>
        <li>
          <strong>Newsletter</strong> — adresse email. Finalité : envoi
          d&apos;informations sur les nouvelles pièces. Base légale :
          consentement (retirable à tout moment).
        </li>
        <li>
          <strong>Paiement</strong> — le règlement est traité par Genius Pay.
          La Maison ne collecte ni ne conserve les données de carte ou de compte
          de paiement.
        </li>
      </ul>

      <h2>Destinataires et sous-traitants</h2>
      <p>
        Vos données sont traitées par la Maison et par les prestataires
        techniques suivants, uniquement pour les finalités ci-dessus :
      </p>
      <ul>
        <li>
          <strong>Genius Pay</strong> — traitement des paiements.
        </li>
        <li>
          <strong>Resend</strong> — envoi des emails transactionnels et de la
          newsletter.
        </li>
        <li>
          <strong>Vercel</strong> — hébergement du site.
        </li>
        <li>
          <strong>Neon</strong> — base de données (commandes, inscriptions,
          catalogue).
        </li>
        <li>
          <strong>Upstash</strong> — limitation de débit (protection anti-abus).
        </li>
        <li>
          <strong>Cloudinary</strong> — hébergement des images et vidéos.
        </li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Les données de commande sont conservées pour la durée nécessaire au
        traitement, au service après-vente et aux obligations comptables et
        légales. Les données de la newsletter sont conservées jusqu&apos;au
        retrait du consentement.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification,
        d&apos;effacement, de limitation, d&apos;opposition et de portabilité de
        vos données. Pour l&apos;exercer, écrivez à{" "}
        <Fill>[email de contact / DPO]</Fill>. Vous pouvez également introduire
        une réclamation auprès de l&apos;autorité de contrôle compétente.
      </p>

      <h2>Cookies et stockage local</h2>
      <p>
        Le site n&apos;utilise pas de cookies publicitaires ni de traceurs
        tiers. Un stockage local (localStorage) est utilisé sur votre appareil
        pour mémoriser le contenu de votre panier et l&apos;affichage du pop-up
        d&apos;inscription. Ces informations ne quittent pas votre navigateur.
      </p>

      <h2>Désinscription de la newsletter</h2>
      <p>
        Vous pouvez vous désinscrire à tout moment en écrivant à{" "}
        <Fill>[email de contact]</Fill>.
      </p>
    </LegalPage>
  );
}
