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
  category: 'film' | 'director' | 'cast' | 'genre';
  relevanceScore: number;
}

async function searchGoogleBooks(query: string, maxResults = 10, lang?: string): Promise<any[]> {
  let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance&printType=books`;
  if (lang) url += `&langRestrict=${lang}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

function mapBookItem(item: any, category: BookResult['category'], score: number): BookResult {
  const info = item.volumeInfo || {};
  const imageLinks = info.imageLinks || {};
  const lang = info.language || 'unknown';
  const langBonus = lang === 'fr' ? 40 : lang === 'en' ? 0 : -10;
  return {
    id: item.id,
    title: info.title || 'Unknown',
    authors: info.authors || [],
    description: info.description || info.subtitle || '',
    publisher: info.publisher || '',
    publishedDate: info.publishedDate || '',
    imageUrl: imageLinks.thumbnail?.replace('http://', 'https://') || imageLinks.smallThumbnail?.replace('http://', 'https://') || null,
    infoLink: info.infoLink || info.previewLink || '',
    category,
    relevanceScore: score + langBonus,
  };
}

async function aiRankBooks(
  books: BookResult[],
  filmTitle: string,
  originalTitle: string | undefined,
  director: string | undefined,
  cast: string[] | undefined,
  genres: string[] | undefined
): Promise<BookResult[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY || books.length === 0) return books;

  const booksForAI = books.map((b, i) => ({
    index: i,
    title: b.title,
    authors: b.authors.join(', '),
    description: b.description.substring(0, 300),
    publisher: b.publisher,
    category: b.category,
  }));

  const prompt = `Tu es un expert en cinéma et en littérature sur le cinéma.
Voici un film : "${filmTitle}"${originalTitle && originalTitle !== filmTitle ? ` (titre original : "${originalTitle}")` : ''}
${director ? `Réalisateur : ${director}` : ''}
${cast?.length ? `Acteurs principaux : ${cast.slice(0, 5).join(', ')}` : ''}
${genres?.length ? `Genres : ${genres.join(', ')}` : ''}

Voici une liste de livres trouvés. Évalue la pertinence de chaque livre par rapport au film.
Sois TRÈS STRICT : seuls les livres qui traitent RÉELLEMENT du film, du réalisateur, des acteurs ou du genre cinématographique doivent avoir un score élevé.
Un livre qui mentionne vaguement un mot-clé commun mais ne parle pas de cinéma doit avoir un score bas.
Attribue un score de 0 à 100 :
- 90-100 : livre directement et spécifiquement sur ce film
- 70-89 : livre consacré au réalisateur de ce film ou analysant en profondeur un aspect majeur du film
- 50-69 : livre sur un acteur principal du film ou le mouvement cinématographique auquel il appartient
- 30-49 : livre pertinent sur le genre cinématographique du film
- 0-29 : peu ou pas pertinent (livre sans rapport réel avec le film ou le cinéma)
- 0-29 : peu ou pas pertinent

Livres :
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
          { role: "system", content: "Tu évalues la pertinence de livres par rapport à un film. Réponds uniquement avec le JSON demandé." },
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
                      index: { type: "number", description: "Book index from the list" },
                      score: { type: "number", description: "Relevance score 0-100" },
                      category: { type: "string", enum: ["film", "director", "cast", "genre"], description: "Best fitting category" },
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
      console.error("AI ranking failed:", response.status);
      return books;
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return books;

    const rankings = JSON.parse(toolCall.function.arguments).rankings as Array<{ index: number; score: number; category: string }>;

    for (const r of rankings) {
      if (r.index >= 0 && r.index < books.length) {
        books[r.index].relevanceScore = r.score + (books[r.index].relevanceScore > 0 ? 40 : 0); // keep lang bonus
        if (['film', 'director', 'cast', 'genre'].includes(r.category)) {
          books[r.index].category = r.category as BookResult['category'];
        }
      }
    }

    // Filter out irrelevant books (strict threshold)
    return books.filter(b => b.relevanceScore >= 60);
  } catch (e) {
    console.error("AI ranking error:", e);
    return books;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filmTitle, originalTitle, director, cast, genres } = await req.json();

    if (!filmTitle) {
      return new Response(JSON.stringify({ error: 'filmTitle is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const seen = new Set<string>();
    const allBooks: BookResult[] = [];

    const addBooks = (items: any[], category: BookResult['category'], baseScore: number) => {
      for (const item of items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          allBooks.push(mapBookItem(item, category, baseScore));
        }
      }
    };

    // 1. Film title — FR then EN
    const titleSearches = [
      searchGoogleBooks(`"${filmTitle}" cinema`, 5, 'fr'),
      searchGoogleBooks(`"${filmTitle}" film`, 5, 'fr'),
    ];
    if (originalTitle && originalTitle !== filmTitle) {
      titleSearches.push(searchGoogleBooks(`"${originalTitle}" film`, 5, 'en'));
      titleSearches.push(searchGoogleBooks(`"${originalTitle}" cinema`, 5, 'fr'));
    }
    // Also search without quotes for broader results
    titleSearches.push(searchGoogleBooks(`${filmTitle} analyse film livre`, 5, 'fr'));
    titleSearches.push(searchGoogleBooks(`${filmTitle} film analysis book`, 5, 'en'));

    const titleResults = await Promise.all(titleSearches);
    for (const results of titleResults) {
      addBooks(results, 'film', 80);
    }

    // 2. Director — FR then EN
    if (director) {
      const directorResults = await Promise.all([
        searchGoogleBooks(`"${director}" cinéma`, 5, 'fr'),
        searchGoogleBooks(`"${director}" cinema filmmaker`, 5, 'en'),
      ]);
      for (const results of directorResults) {
        addBooks(results, 'director', 60);
      }
    }

    // 3. Main cast — FR then EN
    if (cast && cast.length > 0) {
      const mainCast = cast.slice(0, 2);
      const castResults = await Promise.all(
        mainCast.flatMap((name: string) => [
          searchGoogleBooks(`"${name}" acteur cinéma`, 3, 'fr'),
          searchGoogleBooks(`"${name}" actor cinema`, 3, 'en'),
        ])
      );
      for (const results of castResults) {
        addBooks(results, 'cast', 40);
      }
    }

    // 4. Genre — FR then EN
    if (genres && genres.length > 0) {
      const genreQuery = genres.slice(0, 2).join(' ');
      const genreResults = await Promise.all([
        searchGoogleBooks(`${genreQuery} cinéma analyse`, 5, 'fr'),
        searchGoogleBooks(`${genreQuery} cinema analysis`, 5, 'en'),
      ]);
      for (const results of genreResults) {
        addBooks(results, 'genre', 30);
      }
    }

    // Use AI to rank and filter books
    const rankedBooks = await aiRankBooks(allBooks, filmTitle, originalTitle, director, cast, genres);

    // Sort by relevance score, keep only top 10
    rankedBooks.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topBooks = rankedBooks.slice(0, 10);

    return new Response(JSON.stringify({ books: topBooks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Book search error:', error);
    return new Response(JSON.stringify({ error: 'Failed to search books' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
