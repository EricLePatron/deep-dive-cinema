import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

async function searchGoogleBooks(query: string, maxResults = 10): Promise<any[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&langRestrict=fr&orderBy=relevance&printType=books`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

function mapBookItem(item: any, category: BookResult['category'], score: number): BookResult {
  const info = item.volumeInfo || {};
  const imageLinks = info.imageLinks || {};
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
    relevanceScore: score,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filmTitle, originalTitle, director, cast, genres, year } = await req.json();

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

    // 1. Search by film title (highest priority)
    const titleQueries = [
      `"${filmTitle}" cinema livre`,
      `"${filmTitle}" film analyse`,
    ];
    if (originalTitle && originalTitle !== filmTitle) {
      titleQueries.push(`"${originalTitle}" film book`);
    }

    const titleResults = await Promise.all(titleQueries.map(q => searchGoogleBooks(q, 5)));
    for (const results of titleResults) {
      addBooks(results, 'film', 100);
    }

    // 2. Search by director (high priority)
    if (director) {
      const directorResults = await Promise.all([
        searchGoogleBooks(`"${director}" cinéma réalisateur`, 5),
        searchGoogleBooks(`"${director}" filmmaker cinema`, 5),
      ]);
      for (const results of directorResults) {
        addBooks(results, 'director', 70);
      }
    }

    // 3. Search by main cast (medium priority)
    if (cast && cast.length > 0) {
      const mainCast = cast.slice(0, 2);
      const castResults = await Promise.all(
        mainCast.map((name: string) => searchGoogleBooks(`"${name}" acteur cinéma`, 3))
      );
      for (const results of castResults) {
        addBooks(results, 'cast', 50);
      }
    }

    // 4. Search by genre (lower priority)
    if (genres && genres.length > 0) {
      const genreQuery = genres.slice(0, 2).join(' ');
      const genreResults = await searchGoogleBooks(`${genreQuery} cinéma analyse livre`, 5);
      addBooks(genreResults, 'genre', 30);
    }

    // Boost books that mention the film title in their title/description
    const titleLower = filmTitle.toLowerCase();
    const directorLower = (director || '').toLowerCase();
    for (const book of allBooks) {
      const bookTitleLower = book.title.toLowerCase();
      const descLower = book.description.toLowerCase();
      if (bookTitleLower.includes(titleLower)) book.relevanceScore += 50;
      if (descLower.includes(titleLower)) book.relevanceScore += 20;
      if (directorLower && bookTitleLower.includes(directorLower)) book.relevanceScore += 15;
      if (directorLower && descLower.includes(directorLower)) book.relevanceScore += 10;
      // Penalize very short descriptions
      if (book.description.length < 20) book.relevanceScore -= 10;
    }

    // Sort by relevance score
    allBooks.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return new Response(JSON.stringify({ books: allBooks }), {
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
