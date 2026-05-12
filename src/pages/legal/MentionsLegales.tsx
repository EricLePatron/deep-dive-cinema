import { LegalLayout } from "./LegalLayout";

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales" kicker="Informations légales" updated="12 mai 2026">
      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Éditeur du site</h2>
        <p>Le site <strong>Deepdive</strong> (deepdive-cinema.com) est édité par :</p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li><strong>Eric Chollet</strong>, éditeur en qualité de particulier</li>
          <li>Contact : <a href="mailto:contact@deepdive-cinema.com" className="underline hover:opacity-80">contact@deepdive-cinema.com</a></li>
          <li>Directeur de la publication : Eric Chollet</li>
        </ul>
        <p className="mt-3 text-sm text-foreground/60">Conformément à l'article 6-III-2 de la LCEN du 21 juin 2004, l'éditeur étant une personne physique non professionnelle, son adresse postale n'est pas publiée. Elle est tenue à disposition de l'hébergeur et peut être communiquée à toute autorité judiciaire compétente.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Hébergement</h2>
        <p>Le site est hébergé par :</p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li><strong>Lovable</strong> (Lovable AB) — Stockholm, Suède — <a href="https://lovable.dev" target="_blank" rel="noreferrer" className="underline hover:opacity-80">lovable.dev</a></li>
          <li>Infrastructure backend et base de données : <strong>Supabase</strong> (Supabase Inc.) — opérée sur AWS, région Europe (Irlande)</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Propriété intellectuelle</h2>
        <p>L'ensemble des éléments éditoriaux propres à Deepdive (textes, mise en page, charte graphique, code source) est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.</p>
        <p className="mt-3">Les contenus tiers agrégés (affiches, métadonnées de films, vignettes vidéo, jaquettes de podcasts, couvertures de livres) restent la propriété exclusive de leurs ayants droit respectifs. Deepdive se contente de les afficher dans un cadre éditorial et critique, à des fins d'information et de découverte culturelle.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Sources de données tierces</h2>
        <p>Deepdive agrège des informations issues des services suivants :</p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li><strong>TMDB</strong> (The Movie Database) — métadonnées et affiches de films. Ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB.</li>
          <li><strong>YouTube Data API</strong> — vidéos d'analyses cinéphiles publiques.</li>
          <li><strong>Apple Podcasts / iTunes Search API</strong> — métadonnées de podcasts.</li>
          <li><strong>Google Books API</strong> — métadonnées de livres.</li>
          <li><strong>Letterboxd</strong> — flux RSS public des utilisateurs ayant connecté leur profil.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Signalement de contenu</h2>
        <p>Pour toute demande de retrait, signalement de contenu illicite ou réclamation relative aux droits, merci d'écrire à <a href="mailto:contact@deepdive-cinema.com" className="underline hover:opacity-80">contact@deepdive-cinema.com</a>. Une réponse sera apportée dans les meilleurs délais.</p>
      </section>
    </LegalLayout>
  );
}
