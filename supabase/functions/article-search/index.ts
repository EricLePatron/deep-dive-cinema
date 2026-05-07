const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * DDC — Sources Articles (v1.0, Mai 2026)
 *
 * Posture éditoriale stricte :
 *  - Zéro contenu promotionnel
 *  - Zéro presse généraliste sans valeur analytique
 *  - Zéro contenu de fans non signé
 *  - Seulement critiques argumentées, essais de fond, dossiers cinéastes,
 *    analyses formelles, entretiens.
 *
 * Tier 1 = sources prioritaires gratuites (FR puis EN).
 * Tier 2 = sources complémentaires (accès mixte / paywall partiel).
 * Tier 3 = exclues (AlloCiné, Rotten Tomatoes, Wikipedia, blogs anonymes…).
 */

type SourceTier = 1 | 2;
type SourceLang = 'fr' | 'en';
type SourceFormat = 'critique' | 'archive' | 'dossier-pdf';

interface Source {
  domain: string;
  name: string;
  tier: SourceTier;
  lang: SourceLang;
  free: boolean;            // true = 100% gratuit, false = mixte / paywall partiel
  format?: SourceFormat;    // 'archive' = scripts/storyboards, 'dossier-pdf' = Cinémathèque
  angle?: string;           // libellé court à afficher éventuellement
}

const SOURCES: Source[] = [
  // ───────── TIER 1 — FRANCOPHONES (priorité absolue) ─────────
  { domain: 'critikat.com',       name: 'Critikat',                 tier: 1, lang: 'fr', free: true, format: 'critique' },
  { domain: 'dvdclassik.com',     name: 'DVDClassik',               tier: 1, lang: 'fr', free: true, format: 'critique', angle: 'Patrimoine / éditions' },
  { domain: 'troiscouleurs.fr',   name: 'Trois Couleurs',           tier: 1, lang: 'fr', free: true, format: 'critique' },
  { domain: 'cinematheque.fr',    name: 'Cinémathèque française',   tier: 1, lang: 'fr', free: true, format: 'dossier-pdf', angle: 'Dossier pédagogique' },
  { domain: 'chaosreign.fr',      name: 'Chaos Reign',              tier: 1, lang: 'fr', free: true, format: 'critique', angle: 'Genre / expérimental' },
  { domain: 'culturopoing.com',   name: 'Culturopoing',             tier: 1, lang: 'fr', free: true, format: 'critique' },
  { domain: 'debordements.fr',    name: 'Débordements',             tier: 1, lang: 'fr', free: true, format: 'critique' },

  // ───────── TIER 1 — INTERNATIONALES ─────────
  { domain: 'cinephiliabeyond.org', name: 'Cinephilia & Beyond',   tier: 1, lang: 'en', free: true, format: 'archive', angle: 'Scripts / archives' },
  { domain: 'rogerebert.com',     name: 'RogerEbert.com',           tier: 1, lang: 'en', free: true, format: 'critique' },
  { domain: 'criterion.com',      name: 'Criterion Essays',         tier: 1, lang: 'en', free: true, format: 'critique' },
  { domain: 'mubi.com',           name: 'MUBI Notebook',            tier: 1, lang: 'en', free: true, format: 'critique' },
  { domain: 'reverseshot.org',    name: 'Reverse Shot',             tier: 1, lang: 'en', free: true, format: 'critique' },
  { domain: 'sensesofcinema.com', name: 'Senses of Cinema',         tier: 1, lang: 'en', free: true, format: 'critique' },

  // ───────── TIER 2 — COMPLÉMENTAIRES ─────────
  { domain: 'telerama.fr',        name: 'Télérama',                 tier: 2, lang: 'fr', free: false },
  { domain: 'lesinrocks.com',     name: 'Les Inrockuptibles',       tier: 2, lang: 'fr', free: false },
  { domain: 'transfuge.fr',       name: 'Transfuge',                tier: 2, lang: 'fr', free: false },
  { domain: 'sofilm.fr',          name: 'So Film',                  tier: 2, lang: 'fr', free: false },
  { domain: 'positif.fr',         name: 'Positif',                  tier: 2, lang: 'fr', free: false },
  { domain: 'cahiersducinema.com',name: 'Cahiers du Cinéma',        tier: 2, lang: 'fr', free: false },
  { domain: 'bfi.org.uk',         name: 'Sight & Sound (BFI)',      tier: 2, lang: 'en', free: false },
  { domain: 'filmcomment.com',    name: 'Film Comment',             tier: 2, lang: 'en', free: false },
  { domain: 'slantmagazine.com',  name: 'Slant Magazine',           tier: 2, lang: 'en', free: true },
  { domain: 'thefilmstage.com',   name: 'The Film Stage',           tier: 2, lang: 'en', free: true },
  { domain: 'lwlies.com',         name: 'Little White Lies',        tier: 2, lang: 'en', free: false },
  { domain: 'cineaste.com',       name: 'Cineaste',                 tier: 2, lang: 'en', free: false },
];

// Tier 3 — exclus explicitement (filtrage défensif si jamais ils remontent)
const BLOCKED_DOMAINS = [
  'allocine.fr', 'rottentomatoes.com', 'metacritic.com', 'imdb.com',
  'wikipedia.org', 'fr.wikipedia.org', 'en.wikipedia.org',
  'youtube.com', 'youtu.be', 'facebook.com', 'twitter.com', 'x.com',
  'tiktok.com', 'instagram.com', 'reddit.com',
];

// Mots qui signalent une analyse de fond
const QUALITY_KEYWORDS = [
  'critique', 'analyse', 'décryptage', 'lecture', 'entretien', 'interview',
  'essai', 'étude', 'mise en scène', 'cinéaste', 'réalisateur',
  'plan', 'séquence', 'dossier', 'monographie', 'rétrospective',
  'review', 'essay', 'great movies', 'close-up', 'symposium',
];

// Mots qui signalent un contenu promotionnel / news / marketing → exclus
const NEGATIVE_KEYWORDS = [
  'bande-annonce', 'bande annonce', 'trailer', 'teaser', 'box-office', 'box office',
  'streaming', 'où voir', 'où regarder', 'disponible sur', 'sortie dvd',
  'audience', 'casting de', 'photos du tournage', 'people', 'buzz',
  'spoiler', 'fan theory', 'easter egg', 'top 10', 'classement',
];

// Heuristique profondeur : si la description Firecrawl est très courte, c'est
// probablement un brève / news. On préfère un texte descriptif >= ~150 caractères.
const MIN_DESCRIPTION_LENGTH = 80;

function hostnameOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function findSource(host: string): Source | undefined {
  return SOURCES.find((s) => host === s.domain || host.endsWith('.' + s.domain));
}

function isBlocked(host: string): boolean {
  return BLOCKED_DOMAINS.some((d) => host === d || host.endsWith('.' + d));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filmTitle, filmYear, originalTitle, director } = await req.json();
    if (!filmTitle) {
      return new Response(
        JSON.stringify({ success: false, error: 'filmTitle is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pour respecter l'ordre éditorial (FR T1 → EN T1 → T2), on émet des requêtes
    // ciblées par groupe de sources plutôt qu'une grosse requête fourre-tout.
    const t1Fr = SOURCES.filter((s) => s.tier === 1 && s.lang === 'fr');
    const t1En = SOURCES.filter((s) => s.tier === 1 && s.lang === 'en');
    const t2   = SOURCES.filter((s) => s.tier === 2);

    const titles: string[] = [filmTitle];
    if (originalTitle && originalTitle !== filmTitle) titles.push(originalTitle);

    const yearPart = filmYear ? ` ${filmYear}` : '';
    const dirPart  = director ? ` ${director}` : '';

    const buildSites = (group: Source[]) =>
      group.map((s) => `site:${s.domain}`).join(' OR ');

    const queries: { q: string; lang: string; country: string; group: 'fr-t1' | 'en-t1' | 't2' }[] = [];

    for (const t of titles) {
      // FR Tier 1 : 2 angles (critique/analyse + entretien)
      queries.push({
        q: `"${t}"${yearPart} (critique OR analyse OR essai)${dirPart} (${buildSites(t1Fr)})`,
        lang: 'fr', country: 'FR', group: 'fr-t1',
      });
      queries.push({
        q: `"${t}"${dirPart} (entretien OR "mise en scène" OR dossier) (${buildSites(t1Fr)})`,
        lang: 'fr', country: 'FR', group: 'fr-t1',
      });
      // EN Tier 1 : critique + essay + interview
      queries.push({
        q: `"${t}"${yearPart} (review OR essay OR analysis)${dirPart} (${buildSites(t1En)})`,
        lang: 'en', country: 'US', group: 'en-t1',
      });
      queries.push({
        q: `"${t}"${dirPart} (interview OR mise-en-scène OR director) (${buildSites(t1En)})`,
        lang: 'en', country: 'US', group: 'en-t1',
      });
      // Tier 2 : seulement 1 requête pour ne pas sur-représenter
      queries.push({
        q: `"${t}"${yearPart} (critique OR review OR analyse)${dirPart} (${buildSites(t2)})`,
        lang: 'fr', country: 'FR', group: 't2',
      });
    }

    const allResults: any[] = [];
    for (const { q, lang, country } of queries) {
      console.log('Searching articles:', q);
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: q, limit: 12, lang, country }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Firecrawl error:', data);
        continue;
      }
      allResults.push(...(data.data || []));
    }

    // Dedupe by URL
    const seen = new Set<string>();
    const unique = allResults.filter((r: any) => {
      if (!r.url || seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    const filmTitleLower = filmTitle.toLowerCase();
    const originalTitleLower = (originalTitle || '').toLowerCase();
    const directorLower = (director || '').toLowerCase();

    const articles = unique
      .map((r: any) => {
        const url = r.url || '';
        const host = hostnameOf(url);

        // Filtre Tier 3 explicite + whitelist stricte
        if (isBlocked(host)) return null;
        const source = findSource(host);
        if (!source) return null;

        const title = (r.title || '').trim();
        const description = (r.description || '').trim();
        const combined = `${title} ${description}`.toLowerCase();

        // Doit mentionner le film
        const mentionsFilm =
          combined.includes(filmTitleLower) ||
          (!!originalTitleLower && combined.includes(originalTitleLower));
        if (!mentionsFilm) return null;

        // Filtrage promotionnel / marketing
        if (NEGATIVE_KEYWORDS.some((k) => combined.includes(k))) return null;

        // Heuristique de qualité : on rejette les snippets ultra courts SAUF si
        // c'est une source archive (Cinephilia & Beyond, Cinémathèque PDF) où la
        // description est souvent absente.
        const lenientFormat = source.format === 'archive' || source.format === 'dossier-pdf';
        if (!lenientFormat && description.length < MIN_DESCRIPTION_LENGTH) return null;

        // ───── SCORING (cf. PDF DDC v1.0) ─────
        // poids_source_tier : T1 = 10, T2 = 5
        let score = source.tier === 1 ? 10 : 5;

        // poids_langue : FR = +3, EN = 0  (priorité francophone)
        if (source.lang === 'fr') score += 3;

        // poids_profondeur : approximée via longueur de la description
        if (description.length >= 600) score += 4;
        else if (description.length >= 300) score += 2;

        // poids_indexation_film : URL contient le slug du film
        const slug = filmTitleLower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (slug && url.toLowerCase().includes(slug)) score += 3;

        // poids_gratuité
        if (source.free) score += 2;
        else score -= 5;

        // Bonus pertinence éditoriale
        if (combined.includes(filmTitleLower)) score += 4;
        if (originalTitleLower && combined.includes(originalTitleLower)) score += 3;
        if (directorLower && combined.includes(directorLower)) score += 3;
        for (const kw of QUALITY_KEYWORDS) if (combined.includes(kw)) score += 1;

        // Format spécifique : archive (C&B) et dossier PDF (Cinémathèque) sont
        // des contenus uniques → bonus de visibilité.
        if (source.format === 'archive' || source.format === 'dossier-pdf') score += 2;

        const image = r.metadata?.ogImage || r.metadata?.image || r.image || null;

        return {
          id: url,
          url,
          title: title || `${source.name} — ${filmTitle}`,
          description,
          source: source.name,
          sourceTier: source.tier,
          sourceLang: source.lang,
          sourceFormat: source.format || 'critique',
          sourceFree: source.free,
          // backwards-compat for existing UI
          sourceKind: source.tier === 1 ? 'specialized' : 'press',
          image,
          score,
        };
      })
      .filter(Boolean) as any[];

    // Tri par score décroissant
    articles.sort((a, b) => b.score - a.score);

    // Diversification : max 2 articles par source (sauf 1 pour T2 pour éviter
    // qu'une revue payante ne sature les premiers slots)
    const perSource = new Map<string, number>();
    const diversified: any[] = [];
    for (const a of articles) {
      const cap = a.sourceTier === 1 ? 2 : 1;
      const c = perSource.get(a.source) || 0;
      if (c >= cap) continue;
      perSource.set(a.source, c + 1);
      diversified.push(a);
    }

    // Ordre d'affichage final (cf. PDF) :
    //   1. FR Tier 1 (gratuits)
    //   2. EN Tier 1 (gratuits)
    //   3. Tier 2
    const frT1 = diversified.filter((a) => a.sourceTier === 1 && a.sourceLang === 'fr');
    const enT1 = diversified.filter((a) => a.sourceTier === 1 && a.sourceLang === 'en');
    const tier2 = diversified.filter((a) => a.sourceTier === 2);

    const final = [...frT1, ...enT1, ...tier2].slice(0, 24);
    const cleaned = final.map(({ score, ...rest }) => rest);
    console.log(`Found ${cleaned.length} articles (FR-T1=${frT1.length}, EN-T1=${enT1.length}, T2=${tier2.length})`);

    return new Response(
      JSON.stringify({ success: true, articles: cleaned }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});