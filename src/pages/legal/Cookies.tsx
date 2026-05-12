import { LegalLayout } from "./LegalLayout";

export default function Cookies() {
  return (
    <LegalLayout title="Politique cookies" kicker="Cookies & traceurs" updated="12 mai 2026">
      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Cookies utilisés</h2>
        <p>Deepdive n'utilise <strong>aucun cookie publicitaire ni de tracking analytique tiers</strong> (pas de Google Analytics, pas de Facebook Pixel, pas de régie publicitaire).</p>
        <p className="mt-3">Seuls des <strong>cookies et traceurs strictement nécessaires</strong> au fonctionnement du service sont déposés :</p>
        <ul className="list-disc pl-5 mt-3 space-y-2">
          <li><strong>Session d'authentification Supabase</strong> (localStorage) — stocke votre session après connexion via Google. Indispensable pour rester connecté. Durée : jusqu'à déconnexion ou expiration du token.</li>
          <li><strong>Préférences locales</strong> (localStorage) — mémorise certains réglages d'affichage côté navigateur. Aucune donnée n'est envoyée à un serveur tiers.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Consentement</h2>
        <p>Conformément à la directive ePrivacy et aux recommandations de la CNIL, les traceurs strictement nécessaires à la fourniture d'un service expressément demandé par l'utilisateur sont <strong>exemptés de consentement préalable</strong>. Aucune bannière de consentement n'est donc affichée sur Deepdive.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Gestion des cookies</h2>
        <p>Vous pouvez à tout moment supprimer les données stockées localement par Deepdive en vidant le cache et le localStorage de votre navigateur, ou en vous déconnectant depuis l'icône en haut à droite.</p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground mb-3">Services tiers intégrés</h2>
        <p>Lorsque vous regardez une vidéo YouTube intégrée ou écoutez un podcast, ces services peuvent déposer leurs propres cookies, soumis à leurs politiques respectives :</p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:opacity-80">Politique Google / YouTube</a></li>
          <li><a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noreferrer" className="underline hover:opacity-80">Politique Apple (Podcasts)</a></li>
        </ul>
      </section>
    </LegalLayout>
  );
}
