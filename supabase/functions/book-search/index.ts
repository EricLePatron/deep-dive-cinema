import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BookResult {
  id: string;
  title: string;
  authors: string[];
  description: string;
  publisher: string;
  publishedDate: string;
  imageUrl: string | null;
  infoLink: string;
  category: 'film' | 'director' | 'genre';
  relevanceScore: number;
  language: string;
  isbn: string | null;
  retailers: { name: string; url: string }[];
}

async function searchGoogleBooks(query: string, maxResults = 8, lang?: string): Promise<any[]> {
  let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance&printType=books`;
  if (lang) url += `&langRestrict=${lang}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

function buildRetailerLinks(title: string, authors: string[], isbn: string | null, lang: string): { name: string; url: string }[] {
  const searchQuery = encodeURIComponent(`${title} ${authors.slice(0, 1).join('')}`.trim());

  // ISBN-based links are the most precise — use gp/search with field-isbn for direct product matching
  const fnacIsbn   = isbn ? `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${encodeURIComponent(isbn)}&sft=1` : null;
  const fnacText   = `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${searchQuery}&sft=1`;
  const amzFrIsbn  = isbn ? `https://www.amazon.fr/gp/search?index=books&field-isbn=${encodeURIComponent(isbn)}` : null;
  const amzFrText  = `https://www.amazon.fr/s?k=${searchQuery}&i=stripbooks`;
  const amzComIsbn = isbn ? `https://www.amazon.com/gp/search?index=books&field-isbn=${encodeURIComponent(isbn)}` : null;
  const amzComText = `https://www.amazon.com/s?k=${searchQuery}&i=stripbooks`;

  if (lang === 'fr') {
    return [
      { name: 'Fnac',      url: fnacIsbn  || fnacText  },
      { name: 'Amazon.fr', url: amzFrIsbn || amzFrText },
    ];
  }

  // EN / other — Amazon.fr first (import), then Fnac, then Amazon.com
  return [
    { name: 'Amazon.fr', url: amzFrIsbn || amzFrText  },
    { name: 'Fnac',      url: fnacIsbn  || fnacText   },
    { name: 'Amazon',    url: amzComIsbn || amzComText },
  ];
}

function mapBookItem(item: any, category: BookResult['category'], baseScore: number): BookResult {
  const info  = item.volumeInfo || {};
  const lang  = info.language || 'unknown';
  const identifiers = info.industryIdentifiers || [];
  const isbn  = identifiers.find((i: any) => i.type === 'ISBN_13')?.identifier
             || identifiers.find((i: any) => i.type === 'ISBN_10')?.identifier
             || null;
  const title   = info.title || 'Unknown';
  const authors = info.authors || [];
  const imageLinks = info.imageLinks || {};

  return {
    id: item.id,
    title,
    authors,
    description: info.description || info.subtitle || '',
    publisher:   info.publisher   || '',
    publishedDate: info.publishedDate || '',
    imageUrl: imageLinks.thumbnail?.replace('http://', 'https://')
           || imageLinks.smallThumbnail?.replace('http://', 'https://') || null,
    infoLink: info.infoLink || info.previewLink || '',
    category,
    relevanceScore: baseScore,   // will be overwritten by AI
    language: lang,
    isbn,
    retailers: buildRetailerLinks(title, authors, isbn, lang),
  };
}

// ── Blacklist patterns — always score 0 ───────────────────────────────────────
const BLACKLIST_PATTERNS = [
  /management/i, /leadership/i, /business/i, /entrepreneur/i,
  /marketing/i, /investment/i, /finance/i, /self.?help/i,
  /cookbook/i, /recipe/i, /travel guide/i,
];
function isBlacklisted(book: BookResult): boolean {
  const haystack = `${book.title} ${book.description}`.toLowerCase();
  return BLACKLIST_PATTERNS.some(p => p.test(haystack));
}

async function aiRankBooks(
  books: BookResult[],
  filmTitle: string,
  originalTitle: string | undefined,
  director: string | undefined,
  genres: string[] | undefined
): Promise<BookResult[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY || books.length === 0) return [];

  // Pre-filter obvious blacklist before sending to AI
  const candidates = books.filter(b => !isBlacklisted(b));
  if (candidates.length === 0) return [];
  console.log(`AI rank: ${candidates.length} candidates after blacklist`);

  const booksForAI = candidates.map((b, i) => ({
    index: i,
    title: b.title,
    authors: b.authors.join(', '),
    description: b.description.substring(0, 350),
    publisher: b.publisher,
    language: b.language,
    category: b.category,
  }));

  const prompt = `Tu es un expert en cinéma et littérature cinématographique. Sois EXTRÊMEMENT STRICT.

Film : "${filmTitle}"${originalTitle && originalTitle !== filmTitle ? ` (titre original : "${originalTitle}")` : ''}
${director ? `Réalisateur : ${director}` : ''}
${genres?.length ? `Genres TMDB : ${genres.join(', ')}` : ''}

RÈGLES DE SCORING (respecte-les à la lettre) :
- 85–100 : livre DIRECTEMENT consacré à CE film précis (making-of, script publié, analyse exclusive, art book officiel) OU œuvre littéraire adaptée par CE film
- 65–84  : monographie ENTIÈREMENT consacrée à CE réalisateur (biographie, entretiens, rétrospective complète) OU livre ÉCRIT par le réalisateur lui-même
- 45–64  : essai sur le MOUVEMENT CINÉMATOGRAPHIQUE PRÉCIS dont fait partie ce film (ex: Nouvelle Vague, Néoréalisme, J-Horror...) OU sur le genre précis (film noir, slow cinema...)
- 0–44   : tout le reste — NE PAS AFFICHER

LISTE NOIRE AUTOMATIQUE (score = 0 obligatoire) :
- Livres "sur le cinéma" en général sans lien direct avec ce film ou ce réalisateur
- Biographies d'acteurs secondaires
- Ouvrages de management, leadership, business utilisant des métaphores cinéma
- Livres dont seul un mot-clé du titre coïncide par hasard (ex: un livre de biologie nommé "Parasite")
- Livres scolaires ou manuels de réalisation généralistes

Si tu doutes, mets 0. Il vaut MIEUX afficher aucun livre qu'un livre hors sujet.

Livres à évaluer :
${JSON.stringify(booksForAI, null, 1)}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu évalues strictement la pertinence de livres pour un cinéphile. Si un livre n'est pas clairement sur ce film ou ce réalisateur, score = 0. Réponds uniquement avec le JSON demandé." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "rank_books",
            description: "Return relevance scores for each book",
            parameters: {
              type: "object",
              properties: {
                rankings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index:    { type: "number", description: "Book index in the list" },
                      score:    { type: "number", description: "Relevance score 0–100" },
                      category: { type: "string", enum: ["film", "director", "genre"], description: "Best category" },
                    },
                    required: ["index", "score", "category"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["rankings"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "rank_books" } },
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("AI ranking failed:", response.status, txt);
      return [];
    }

    const data = await response.json();
    console.log("AI raw choices:", JSON.stringify(data.choices?.[0]?.message ?? {}).slice(0, 500));
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("AI ranking: no tool_call returned");
      return [];
    }

    const rankings = JSON.parse(toolCall.function.arguments).rankings as Array<{
      index: number; score: number; category: string;
    }>;
    console.log("AI rankings:", JSON.stringify(rankings));
    console.log("Candidate titles:", candidates.map((c, i) => `${i}:${c.title}`).join(" | "));

    for (const r of rankings) {
      if (r.index >= 0 && r.index < candidates.length) {
        const aiScore = r.score;
        // Bonus langue FR : +10 si le livre est déjà pertinent (score >= 40)
        // Favorise les éditions françaises à égalité de pertinence, sans faire remonter des livres hors sujet
        const langBonus = candidates[r.index].language === 'fr' && aiScore >= 40 ? 10 : 0;
        candidates[r.index].relevanceScore = aiScore + langBonus;
        if (['film', 'director', 'genre'].includes(r.category)) {
          candidates[r.index].category = r.category as BookResult['category'];
        }
      }
    }

    // STRICT FILTER — no fallback. If nothing is relevant, return empty.
    // "Il vaut mieux rien que quelque chose hors sujet."
    // Seuil à 45 : aligne avec la grille de scoring (45 = mouvement ciné précis)
    const RELEVANCE_THRESHOLD = 45;
    const filtered = candidates.filter(b => b.relevanceScore >= RELEVANCE_THRESHOLD);
    console.log(`Filtered ${filtered.length}/${candidates.length} books above threshold ${RELEVANCE_THRESHOLD}`);
    return filtered;

  } catch (e) {
    console.error("AI ranking error:", e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { filmTitle, originalTitle, director, genres } = await req.json();

    if (!filmTitle) {
      return new Response(JSON.stringify({ error: 'filmTitle is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const seen    = new Set<string>();
    const allBooks: BookResult[] = [];

    const addBooks = (items: any[], category: BookResult['category'], baseScore: number) => {
      for (const item of items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          allBooks.push(mapBookItem(item, category, baseScore));
        }
      }
    };

    // ── Niveau 1 — Film (score base 85) ──────────────────────────────────────
    // Toujours combiner titre + réalisateur pour disambiguïser (ex: "Parasite" sans
    // Bong Joon-ho retourne des livres de biologie)
    const filmQueries: Promise<any[]>[] = [];

    if (director) {
      // Combinaison titre + réalisateur = requête la plus précise
      filmQueries.push(searchGoogleBooks(`"${filmTitle}" "${director}"`, 8));
      filmQueries.push(searchGoogleBooks(`"${filmTitle}" ${director} film`, 6, 'fr'));
      filmQueries.push(searchGoogleBooks(`"${filmTitle}" ${director} cinema`, 6, 'en'));
    } else {
      filmQueries.push(searchGoogleBooks(`"${filmTitle}" film analyse`, 6, 'fr'));
      filmQueries.push(searchGoogleBooks(`"${filmTitle}" film analysis`, 6, 'en'));
    }
    // Recherche par titre original uniquement si en caractères latins
    const isLatin = (s: string) => /^[\x00-\xFF\s]+$/.test(s);
    if (originalTitle && originalTitle !== filmTitle && isLatin(originalTitle)) {
      if (director) {
        filmQueries.push(searchGoogleBooks(`"${originalTitle}" ${director}`, 6, 'en'));
      }
      filmQueries.push(searchGoogleBooks(`"${originalTitle}" screenplay`, 5, 'en'));
    }
    const filmResults = await Promise.all(filmQueries);
    for (const results of filmResults) addBooks(results, 'film', 85);

    // ── Niveau 2 — Réalisateur monographie (score base 65) ───────────────────
    if (director) {
      const dirResults = await Promise.all([
        searchGoogleBooks(`"${director}" réalisateur cinéma`, 6, 'fr'),
        searchGoogleBooks(`"${director}" monographie cinéma`, 5, 'fr'),
        searchGoogleBooks(`"${director}" filmmaker cinema`, 6, 'en'),
        searchGoogleBooks(`"${director}" director films`, 6, 'en'),
        searchGoogleBooks(`inauthor:"${director}" cinema`, 5, 'en'),
      ]);
      for (const results of dirResults) addBooks(results, 'director', 65);
    }

    // ── Niveau 3 — Mouvement/genre (score base 40 — uniquement si niveaux 1+2 maigres) ──
    if (allBooks.length < 8 && genres && genres.length > 0) {
      // Traduire les genres TMDB génériques en sous-genres cinéphiles précis
      const cinephileGenreMap: Record<string, string[]> = {
        'Science Fiction': ['"science-fiction" cinéma analyse', '"SF" films essai'],
        'Horror':          ['"horreur" cinéma analyse', '"film d\'horreur" essai'],
        'Animation':       ['"animation" cinéma', '"cinéma d\'animation" essai'],
        'Crime':           ['"film noir" cinéma', '"policier" cinéma français'],
        'Thriller':        ['"thriller" cinéma analyse', '"suspense" cinema'],
        'Drama':           ['"cinéma d\'auteur" analyse', '"néoréalisme" films'],
        'Romance':         ['"mélo" cinéma', '"romance" cinéma classique'],
        'History':         ['"cinéma historique" analyse'],
        'War':             ['"film de guerre" cinéma essai'],
        'Western':         ['"western" cinéma analyse'],
        'Documentary':     ['"documentaire" cinéma'],
        'Music':           ['"film musical" cinéma'],
      };
      const genreQueries: Promise<any[]>[] = [];
      for (const g of genres.slice(0, 2)) {
        const mapped = cinephileGenreMap[g];
        if (mapped) {
          for (const q of mapped.slice(0, 1)) genreQueries.push(searchGoogleBooks(q, 5, 'fr'));
        }
      }
      if (genreQueries.length > 0) {
        const genreResults = await Promise.all(genreQueries);
        for (const results of genreResults) addBooks(results, 'genre', 40);
      }
    }

    // ── Ranking IA + filtrage strict ─────────────────────────────────────────
    const ranked = await aiRankBooks(allBooks, filmTitle, originalTitle, director, genres);

    // Sort: FR first, then by score descending. Max 6 livres.
    ranked.sort((a, b) => {
      if (a.language === 'fr' && b.language !== 'fr') return -1;
      if (a.language !== 'fr' && b.language === 'fr') return  1;
      return b.relevanceScore - a.relevanceScore;
    });
    const topBooks = ranked.slice(0, 6);

    return new Response(JSON.stringify({ books: topBooks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Book search error:', error);
    return new Response(JSON.stringify({ error: 'Failed to search books' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
