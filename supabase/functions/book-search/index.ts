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

// ── Open Library API (free, no key, no quota) ─────────────────────────────────
async function searchOpenLibrary(query: string, maxResults = 8, lang?: string): Promise<any[]> {
  const fields = 'key,title,author_name,first_publish_year,language,isbn,cover_i,publisher,subject';
  let url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=${fields}&limit=${maxResults}`;
  if (lang === 'fr') url += `&language=fre`;
  if (lang === 'en') url += `&language=eng`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch {
    return [];
  }
}

function buildRetailerLinks(title: string, authors: string[], isbn: string | null, lang: string): { name: string; url: string }[] {
  const searchQuery = encodeURIComponent(`${title} ${authors.slice(0, 1).join('')}`.trim());

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

  return [
    { name: 'Amazon.fr', url: amzFrIsbn || amzFrText  },
    { name: 'Fnac',      url: fnacIsbn  || fnacText   },
    { name: 'Amazon',    url: amzComIsbn || amzComText },
  ];
}

function mapOpenLibraryDoc(doc: any, category: BookResult['category'], baseScore: number): BookResult {
  const langs: string[] = doc.language || [];
  const lang = langs.includes('fre') ? 'fr'
             : langs.includes('eng') ? 'en'
             : langs[0] || 'unknown';

  const isbns: string[] = doc.isbn || [];
  const isbn = isbns.find((i: string) => i.length === 13)
            || isbns.find((i: string) => i.length === 10)
            || null;

  const title   = doc.title || 'Unknown';
  const authors = doc.author_name || [];
  const coverId = doc.cover_i;
  const imageUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
  const infoLink = doc.key ? `https://openlibrary.org${doc.key}` : '';
  const publishers: string[] = doc.publisher || [];
  const publisher = publishers[0] || '';
  const year = doc.first_publish_year ? String(doc.first_publish_year) : '';

  // Generate a stable id from key or title+author
  const id = doc.key
    ? doc.key.replace('/works/', 'ol_')
    : `ol_${title}_${authors[0] || ''}`.replace(/\s+/g, '_').substring(0, 50);

  return {
    id,
    title,
    authors,
    description: '',   // Open Library search doesn't return descriptions
    publisher,
    publishedDate: year,
    imageUrl,
    infoLink,
    category,
    relevanceScore: baseScore,
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

function normalizeText(value: string | undefined | null): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function hasWholePhrase(haystack: string, phrase: string | undefined): boolean {
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedPhrase || normalizedPhrase.length < 3) return false;
  return ` ${haystack} `.includes(` ${normalizedPhrase} `);
}

function locallyScoreBooks(
  books: BookResult[],
  filmTitle: string,
  originalTitle: string | undefined,
  director: string | undefined,
  genres: string[] | undefined
): BookResult[] {
  const film = normalizeText(filmTitle);
  const original = normalizeText(originalTitle);
  const directorName = normalizeText(director);
  const directorParts = directorName.split(' ').filter(Boolean);
  const directorLastName = directorParts.at(-1) || '';
  const cinemaTerms = ['cinema', 'film', 'films', 'movie', 'movies', 'director', 'filmmaker', 'realisateur', 'retrospective', 'interviews', 'entretiens'];

  return books
    .filter(b => !isBlacklisted(b))
    .map((book) => {
      const title = normalizeText(book.title);
      const authors = normalizeText(book.authors.join(' '));
      const publisher = normalizeText(book.publisher);
      const haystack = `${title} ${authors} ${publisher}`;
      const mentionsFilm = hasWholePhrase(title, film) || (original && original !== film && hasWholePhrase(title, original));
      const authorIsDirector = directorName && hasWholePhrase(authors, directorName);
      const titleMentionsDirector = directorName && hasWholePhrase(title, directorName);
      const titleMentionsDirectorLastName = directorLastName.length >= 5 && hasWholePhrase(title, directorLastName);
      const hasCinemaContext = cinemaTerms.some(term => hasWholePhrase(haystack, term));

      let score = 0;
      let category: BookResult['category'] = book.category;

      if (mentionsFilm && authorIsDirector) {
        score = 96;
        category = 'film';
      } else if (mentionsFilm) {
        score = 90;
        category = 'film';
      } else if (authorIsDirector) {
        score = 74;
        category = 'director';
      } else if (titleMentionsDirector || (titleMentionsDirectorLastName && hasCinemaContext)) {
        score = 68;
        category = 'director';
      } else if (book.category === 'genre' && hasCinemaContext && genres?.some(g => hasWholePhrase(haystack, g))) {
        score = 50;
        category = 'genre';
      }

      if (book.language === 'fr' && score >= 45) score += 8;
      return { ...book, relevanceScore: score, category };
    })
    .filter(b => b.relevanceScore >= 45);
}

async function aiRankBooks(
  books: BookResult[],
  filmTitle: string,
  originalTitle: string | undefined,
  director: string | undefined,
  genres: string[] | undefined
): Promise<BookResult[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (books.length === 0) return [];

  const localRanked = locallyScoreBooks(books, filmTitle, originalTitle, director, genres);
  if (!LOVABLE_API_KEY) return localRanked;

  const candidates = books.filter(b => !isBlacklisted(b));
  if (candidates.length === 0) return localRanked;
  for (const candidate of candidates) candidate.relevanceScore = 0;
  console.log(`AI rank: ${candidates.length} candidates after blacklist`);

  const booksForAI = candidates.map((b, i) => ({
    index: i,
    title: b.title,
    authors: b.authors.join(', '),
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
      return localRanked;
    }

    const data = await response.json();
    console.log("AI raw choices:", JSON.stringify(data.choices?.[0]?.message ?? {}).slice(0, 500));
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("AI ranking: no tool_call returned");
      return localRanked;
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
        const langBonus = candidates[r.index].language === 'fr' && aiScore >= 40 ? 10 : 0;
        candidates[r.index].relevanceScore = aiScore + langBonus;
        if (['film', 'director', 'genre'].includes(r.category)) {
          candidates[r.index].category = r.category as BookResult['category'];
        }
      }
    }

    // STRICT FILTER — no fallback. If nothing is relevant, return empty.
    const RELEVANCE_THRESHOLD = 45;
    const merged = new Map<string, BookResult>();
    for (const book of localRanked) merged.set(book.id, book);
    for (const book of candidates.filter(b => b.relevanceScore >= RELEVANCE_THRESHOLD)) {
      const existing = merged.get(book.id);
      merged.set(book.id, existing && existing.relevanceScore > book.relevanceScore ? existing : book);
    }
    const filtered = Array.from(merged.values());
    console.log(`Filtered ${filtered.length}/${candidates.length} books above threshold ${RELEVANCE_THRESHOLD}`);
    return filtered;

  } catch (e) {
    console.error("AI ranking error:", e);
    return localRanked;
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
        const mapped = mapOpenLibraryDoc(item, category, baseScore);
        if (!seen.has(mapped.id)) {
          seen.add(mapped.id);
          allBooks.push(mapped);
        }
      }
    };

    // ── Niveau 1 — Film (score base 85) ──────────────────────────────────────
    const filmQueries: Promise<any[]>[] = [];

    if (director) {
      filmQueries.push(searchOpenLibrary(`${filmTitle} ${director}`, 8));
      filmQueries.push(searchOpenLibrary(`${filmTitle} ${director} film`, 6));
      filmQueries.push(searchOpenLibrary(`${filmTitle} ${director}`, 6, 'fr'));
      filmQueries.push(searchOpenLibrary(`${filmTitle} ${director}`, 6, 'en'));
    } else {
      filmQueries.push(searchOpenLibrary(`${filmTitle} film analyse`, 6, 'fr'));
      filmQueries.push(searchOpenLibrary(`${filmTitle} film analysis`, 6, 'en'));
    }

    // Original title (Latin only)
    const isLatin = (s: string) => /^[\x00-\xFF\s]+$/.test(s);
    if (originalTitle && originalTitle !== filmTitle && isLatin(originalTitle)) {
      if (director) {
        filmQueries.push(searchOpenLibrary(`${originalTitle} ${director}`, 6, 'en'));
      }
      filmQueries.push(searchOpenLibrary(`${originalTitle} screenplay`, 5, 'en'));
    }

    const filmResults = await Promise.all(filmQueries);
    for (const results of filmResults) addBooks(results, 'film', 85);

    // ── Niveau 2 — Réalisateur monographie (score base 65) ───────────────────
    if (director) {
      const dirResults = await Promise.all([
        // Bare director name — Open Library full-text — captures most monographs
        searchOpenLibrary(`${director}`, 12),
        searchOpenLibrary(`${director}`, 8, 'fr'),
        searchOpenLibrary(`${director}`, 8, 'en'),
        searchOpenLibrary(`${director} cinéma`, 6, 'fr'),
        searchOpenLibrary(`${director} cinema`, 6, 'en'),
      ]);
      for (const results of dirResults) addBooks(results, 'director', 65);
    }

    // ── Niveau 3 — Mouvement/genre (score base 40 — uniquement si niveaux 1+2 maigres) ──
    if (allBooks.length < 8 && genres && genres.length > 0) {
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
          for (const q of mapped.slice(0, 1)) genreQueries.push(searchOpenLibrary(q, 5, 'fr'));
        }
      }
      if (genreQueries.length > 0) {
        const genreResults = await Promise.all(genreQueries);
        for (const results of genreResults) addBooks(results, 'genre', 40);
      }
    }

    console.log(`Total candidates before AI: ${allBooks.length}`);

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
