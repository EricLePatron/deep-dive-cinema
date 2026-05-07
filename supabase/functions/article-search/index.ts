const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Curated cinephile + free-press sources
// kind: 'specialized' = revues / sites cinéphiles, 'press' = presse généraliste accessible
const SOURCES: { domain: string; name: string; kind: 'specialized' | 'press'; weight: number }[] = [
  // Spécialisés cinéma (poids fort)
  { domain: 'cahiersducinema.com', name: 'Cahiers du Cinéma', kind: 'specialized', weight: 10 },
  { domain: 'critikat.com', name: 'Critikat', kind: 'specialized', weight: 10 },
  { domain: 'debordements.fr', name: 'Débordements', kind: 'specialized', weight: 10 },
  { domain: 'revue-etudes.com', name: 'Études', kind: 'specialized', weight: 7 },
  { domain: 'transfuge.fr', name: 'Transfuge', kind: 'specialized', weight: 8 },
  { domain: 'positif.fr', name: 'Positif', kind: 'specialized', weight: 9 },
  { domain: 'sofilm.fr', name: 'So Film', kind: 'specialized', weight: 8 },
  { domain: 'trois-couleurs.fr', name: 'Trois Couleurs', kind: 'specialized', weight: 8 },
  { domain: 'senscritique.com', name: 'SensCritique', kind: 'specialized', weight: 4 },
  { domain: 'dvdclassik.com', name: 'DVDClassik', kind: 'specialized', weight: 9 },
  { domain: 'chaosreign.fr', name: 'Chaos Reign', kind: 'specialized', weight: 6 },
  { domain: 'accreds.fr', name: 'Accreds', kind: 'specialized', weight: 6 },
  { domain: 'lesinrocks.com', name: 'Les Inrockuptibles', kind: 'specialized', weight: 7 },
  // Presse généraliste accessible gratuitement
  { domain: 'lemonde.fr', name: 'Le Monde', kind: 'press', weight: 6 },
  { domain: 'liberation.fr', name: 'Libération', kind: 'press', weight: 6 },
  { domain: 'telerama.fr', name: 'Télérama', kind: 'press', weight: 8 },
  { domain: 'lefigaro.fr', name: 'Le Figaro', kind: 'press', weight: 5 },
  { domain: 'humanite.fr', name: "L'Humanité", kind: 'press', weight: 6 },
  { domain: 'francetvinfo.fr', name: 'France Info', kind: 'press', weight: 5 },
  { domain: 'franceculture.fr', name: 'France Culture', kind: 'press', weight: 8 },
  { domain: 'rfi.fr', name: 'RFI', kind: 'press', weight: 5 },
  { domain: 'slate.fr', name: 'Slate', kind: 'press', weight: 6 },
  { domain: 'nouvelobs.com', name: "L'Obs", kind: 'press', weight: 6 },
  { domain: 'lepoint.fr', name: 'Le Point', kind: 'press', weight: 5 },
];

// Keywords that suggest critical/analytical content rather than news/marketing
const QUALITY_KEYWORDS = [
  'critique', 'analyse', 'décryptage', 'lecture', 'entretien', 'interview',
  'essai', 'étude', 'mise en scène', 'cinéaste', 'réalisateur', 'film',
];
const NEGATIVE_KEYWORDS = [
  'bande-annonce', 'trailer', 'teaser', 'box-office', 'streaming', 'où voir',
  'sortie dvd', 'audience', 'casting de', 'photos du tournage', 'people',
];

function hostnameOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
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

    const sitesFilter = SOURCES.map((s) => `site:${s.domain}`).join(' OR ');

    const titles: string[] = [filmTitle];
    if (originalTitle && originalTitle !== filmTitle) titles.push(originalTitle);

    // Two query angles per title: critique/analyse + entretien
    const queries: string[] = [];
    for (const t of titles) {
      const yearPart = filmYear ? ` ${filmYear}` : '';
      const dirPart = director ? ` ${director}` : '';
      queries.push(`"${t}"${yearPart} critique analyse${dirPart} (${sitesFilter})`);
      queries.push(`"${t}"${dirPart} entretien OR mise en scène (${sitesFilter})`);
    }

    const allResults: any[] = [];
    for (const query of queries) {
      console.log('Searching articles:', query);
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 15, lang: 'fr', country: 'FR' }),
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
        const source = SOURCES.find((s) => host === s.domain || host.endsWith('.' + s.domain));
        if (!source) return null; // strict whitelist

        const title = r.title || '';
        const description = r.description || '';
        const combined = `${title} ${description}`.toLowerCase();

        // Must mention the film (or original title) somewhere
        const mentionsFilm =
          combined.includes(filmTitleLower) ||
          (!!originalTitleLower && combined.includes(originalTitleLower));
        if (!mentionsFilm) return null;

        // Negative filtering: skip news/marketing
        if (NEGATIVE_KEYWORDS.some((k) => combined.includes(k))) return null;

        let score = source.weight;
        if (combined.includes(filmTitleLower)) score += 6;
        if (originalTitleLower && combined.includes(originalTitleLower)) score += 4;
        if (directorLower && combined.includes(directorLower)) score += 3;
        for (const kw of QUALITY_KEYWORDS) if (combined.includes(kw)) score += 1;
        if (source.kind === 'specialized') score += 3;

        const image = r.metadata?.ogImage || r.metadata?.image || r.image || null;

        return {
          id: url,
          url,
          title: r.title || `${source.name} — ${filmTitle}`,
          description: r.description || '',
          source: source.name,
          sourceKind: source.kind,
          image,
          score,
        };
      })
      .filter(Boolean) as any[];

    articles.sort((a, b) => b.score - a.score);

    // Diversify: cap 2 per source so we mix specialized + press
    const perSource = new Map<string, number>();
    const diversified: any[] = [];
    for (const a of articles) {
      const c = perSource.get(a.source) || 0;
      if (c >= 2) continue;
      perSource.set(a.source, c + 1);
      diversified.push(a);
    }

    // Ensure mix: try to keep both specialized and press in top results
    const top = diversified.slice(0, 18);
    const specialized = top.filter((a) => a.sourceKind === 'specialized');
    const press = top.filter((a) => a.sourceKind === 'press');
    let final = top;
    if (specialized.length > 0 && press.length > 0) {
      // interleave: 2 specialized, 1 press
      const out: any[] = [];
      let s = 0, p = 0;
      while (s < specialized.length || p < press.length) {
        if (s < specialized.length) out.push(specialized[s++]);
        if (s < specialized.length) out.push(specialized[s++]);
        if (p < press.length) out.push(press[p++]);
      }
      final = out;
    }

    const cleaned = final.map(({ score, ...rest }) => rest);
    console.log(`Found ${cleaned.length} articles`);

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