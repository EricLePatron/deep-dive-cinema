import { LegalLayout } from "./LegalLayout";

export default function Confidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité" kicker="Données personnelles" updated="12 mai 2026">
      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Responsable du traitement</h2>
        <p>Le responsable du traitement des données collectées sur Deepdive est <strong>Eric Chollet</strong>. Contact : <a href="mailto:contact@deepdive-cinema.com" className="underline hover:opacity-80">contact@deepdive-cinema.com</a>.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Données collectées</h2>
        <p>Deepdive collecte uniquement les données strictement nécessaires à son fonctionnement :</p>
        <ul className="list-disc pl-5 mt-3 space-y-2">
          <li><strong>Compte utilisateur</strong> (via authentification Google OAuth) : adresse email, nom, photo de profil, identifiant Google. Base légale : exécution du service (article 6.1.b RGPD).</li>
          <li><strong>Profil Letterboxd</strong> (facultatif) : nom d'utilisateur Letterboxd que vous renseignez, et flux public associé (films vus, dates, notes). Base légale : votre consentement (article 6.1.a RGPD).</li>
          <li><strong>Favoris et films marqués comme vus</strong> : identifiants des films que vous enregistrez. Base légale : exécution du service.</li>
          <li><strong>Retours sur les vidéos suggérées</strong> (pertinent / non pertinent) : utilisés pour améliorer les recommandations. Base légale : intérêt légitime à améliorer le service.</li>
        </ul>
        <p className="mt-3">Aucune donnée bancaire n'est collectée (le service est gratuit). Aucun outil de tracking publicitaire ni d'analytics tiers n'est utilisé.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Destinataires et sous-traitants</h2>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li><strong>Supabase Inc.</strong> — hébergement de la base de données et de l'authentification (AWS Europe, Irlande).</li>
          <li><strong>Lovable AB</strong> — hébergement de l'application web.</li>
          <li><strong>Google LLC</strong> — fournisseur d'identité (Google OAuth).</li>
        </ul>
        <p className="mt-3">Vos données ne sont ni vendues, ni cédées, ni transmises à des tiers à des fins commerciales.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Durée de conservation</h2>
        <p>Vos données sont conservées tant que votre compte est actif. Elles sont supprimées sur demande ou à la suppression de votre compte.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Vos droits (RGPD)</h2>
        <p>Conformément au Règlement (UE) 2016/679 et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Droit d'accès, de rectification et d'effacement de vos données</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition et de limitation du traitement</li>
          <li>Droit de retirer votre consentement à tout moment</li>
          <li>Droit d'introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="underline hover:opacity-80">cnil.fr</a>)</li>
        </ul>
        <p className="mt-3">Pour exercer ces droits, écrivez à <a href="mailto:contact@deepdive-cinema.com" className="underline hover:opacity-80">contact@deepdive-cinema.com</a>.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Sécurité</h2>
        <p>Les données sont stockées de manière chiffrée et accessibles uniquement à leur propriétaire grâce à un système de Row-Level Security au niveau de la base de données.</p>
      </section>
    </LegalLayout>
  );
}
