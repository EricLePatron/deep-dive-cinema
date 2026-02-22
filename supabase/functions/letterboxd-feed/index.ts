const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize username
    const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleanUsername) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid username' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rssUrl = `https://letterboxd.com/${cleanUsername}/rss/`;
    console.log('Fetching Letterboxd RSS:', rssUrl);

    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'DeepDive Cinema App' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ success: false, error: 'Utilisateur Letterboxd introuvable' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xml = await response.text();

    // Parse RSS XML to extract film entries
    const films: Array<{
      title: string;
      filmTitle: string;
      filmYear: string;
      rating: number;
      watchedDate: string;
      link: string;
    }> = [];

    // Extract items from RSS
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];

      const getTag = (tag: string) => {
        const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's');
        const m = item.match(r);
        return m ? m[1].trim() : '';
      };

      const title = getTag('title');
      const link = getTag('link');
      const pubDate = getTag('pubDate');

      // Extract letterboxd-specific tags
      const filmTitleMatch = item.match(/<letterboxd:filmTitle>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/letterboxd:filmTitle>/s);
      const filmYearMatch = item.match(/<letterboxd:filmYear>(\d{4})<\/letterboxd:filmYear>/);
      const ratingMatch = item.match(/<letterboxd:memberRating>([\d.]+)<\/letterboxd:memberRating>/);
      const watchedDateMatch = item.match(/<letterboxd:watchedDate>([\d-]+)<\/letterboxd:watchedDate>/);

      if (filmTitleMatch) {
        films.push({
          title,
          filmTitle: filmTitleMatch[1].trim(),
          filmYear: filmYearMatch ? filmYearMatch[1] : '',
          rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
          watchedDate: watchedDateMatch ? watchedDateMatch[1] : pubDate,
          link,
        });
      }
    }

    console.log(`Found ${films.length} films for ${cleanUsername}`);

    return new Response(
      JSON.stringify({ success: true, films: films.slice(0, 20) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching Letterboxd feed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch feed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
