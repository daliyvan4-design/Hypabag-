import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: true, follow: true },
};

export default function MentionsLegales() {
  return (
    <LegalPage kicker="INFORMATIONS LÉGALES" title="Mentions légales" updated="12 juillet 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site HYPA est édité par <Fill>[RAISON SOCIALE]</Fill>,{" "}
        <Fill>[forme juridique]</Fill> au capital de <Fill>[montant] FCFA</Fill>,
        dont le siège social est situé <Fill>[adresse complète]</Fill>.
      </p>
      <ul>
        <li>
          Immatriculation : <Fill>[RCCM / SIRET]</Fill>
        </li>
        <li>
          Numéro d&apos;identification fiscale : <Fill>[NIF / TVA]</Fill>
        </li>
        <li>
          Directeur de la publication : <Fill>[nom du responsable]</Fill>
        </li>
        <li>
          Contact : <Fill>[email de contact]</Fill> ·{" "}
          <Fill>[téléphone]</Fill>
        </li>
      </ul>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
        91789, États-Unis — <a href="https://vercel.com">vercel.com</a>. Les
        données sont stockées auprès de prestataires détaillés dans la{" "}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur le site (textes, photographies,
        identité visuelle, mise en page) est la propriété exclusive de{" "}
        <Fill>[RAISON SOCIALE]</Fill> ou de ses partenaires, et protégé par le
        droit de la propriété intellectuelle. Toute reproduction ou
        représentation, totale ou partielle, sans autorisation écrite préalable,
        est interdite.
      </p>

      <h2>Responsabilité</h2>
      <p>
        L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des
        informations diffusées mais ne saurait être tenu responsable des
        omissions, inexactitudes ou carences dans la mise à jour. Chaque pièce
        étant façonnée à la main, de légères variations de teinte et de tressage
        sont inhérentes au produit et ne constituent pas un défaut.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative au site ou à une commande, écrivez à{" "}
        <Fill>[email de contact]</Fill>.
      </p>
    </LegalPage>
  );
}
