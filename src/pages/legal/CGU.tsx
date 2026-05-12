import { LegalLayout } from "./LegalLayout";

export default function CGU() {
  return (
    <LegalLayout title="Conditions générales d'utilisation" kicker="CGU" updated="12 mai 2026">
      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">1. Objet</h2>
        <p>Les présentes CGU régissent l'utilisation du site Deepdive (deepdive-cinema.com), un service éditorial gratuit qui agrège et présente des contenus cinéphiles (analyses vidéo, podcasts, livres, éditions physiques) autour des films.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">2. Accès au service</h2>
        <p>L'accès en lecture est libre. Certaines fonctionnalités (favoris, diary Letterboxd, films vus) nécessitent la création d'un compte via Google OAuth. Le service est fourni gratuitement, sans garantie de disponibilité ni de continuité.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">3. Compte utilisateur</h2>
        <p>Vous êtes responsable de la confidentialité de votre compte Google associé. Vous pouvez à tout moment vous déconnecter ou demander la suppression de votre compte en écrivant à <a href="mailto:contact@deepdive-cinema.com" className="underline hover:opacity-80">contact@deepdive-cinema.com</a>.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">4. Contenus tiers</h2>
        <p>Deepdive agrège des contenus publiés par des tiers (vidéos YouTube, podcasts, livres, métadonnées TMDB, flux Letterboxd). Deepdive ne produit ni n'héberge ces contenus et n'est pas responsable de leur exactitude, de leur disponibilité, ni des opinions qui y sont exprimées.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">5. Propriété intellectuelle</h2>
        <p>Les éléments propres à Deepdive (design, code, sélections éditoriales) sont protégés. L'utilisateur s'engage à ne pas reproduire, copier ou exploiter le service à des fins commerciales sans autorisation écrite préalable.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">6. Responsabilité</h2>
        <p>Le service est fourni « tel quel ». L'éditeur ne saurait être tenu responsable d'éventuels dommages directs ou indirects liés à l'utilisation du site, à une interruption de service ou à une erreur dans les contenus agrégés.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">7. Modification des CGU</h2>
        <p>Les présentes CGU peuvent être modifiées à tout moment. La version en vigueur est celle publiée à la date de votre visite.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">8. Droit applicable</h2>
        <p>Les présentes CGU sont soumises au droit français. Tout litige relèvera de la compétence des juridictions françaises.</p>
      </section>
    </LegalLayout>
  );
}
