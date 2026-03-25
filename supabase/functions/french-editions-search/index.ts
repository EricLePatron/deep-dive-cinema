const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FRENCH_RETAILERS = [
  { name: "Potemkine", domain: "store.potemkine.fr" },
  { name: "Carlotta Films", domain: "carlottafilms.com" },
  { name: "Fnac", domain: "fnac.com" },
  { name: "Amazon.fr", domain: "amazon.fr" },
  { name: "Wild Side", domain: "wildsidevideoclub.com" },
  { name: "Spectrum Films", domain: "spectrumfilms.fr" },
];

// Higher = more relevant
const FORMAT_PRIORITY: Record<string, number> = {
  '4K UHD': 4,
  'Collector': 3,
  'Blu-ray': 2,
  'DVD': 1,
};

function detectFormat(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('4k') || lower.includes('uhd')) return '4K UHD';
  if (lower.includes('steelbook') || lower.includes('collector') || lower.includes('coffret')) return 'Collector';
  if (lower.includes('blu-ray') || lower.includes('bluray') || lower.includes('blu ray')) return 'Blu-ray';
  return 'DVD';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filmTitle, filmYear, originalTitle } = await req.json();

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

    const sitesFilter = 'site:potemkine.fr OR site:carlottafilms.com OR site:fnac.com OR site:amazon.fr OR site:wildsidevideoclub.com OR site:spectrumfilms.fr';

    const titles = [filmTitle];
    if (originalTitle && originalTitle !== filmTitle) {
      titles.push(originalTitle);
    }

    const allResults: any[] = [];

    for (const title of titles) {
      const query = `"${title}" ${filmYear || ''} blu-ray DVD ${sitesFilter}`;
      console.log('Searching French editions:', query);

      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 15,
          lang: 'fr',
          country: 'FR',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Firecrawl error:', data);
        continue;
      }

      allResults.push(...(data.data || []));
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    const uniqueResults = allResults.filter((r: any) => {
      if (!r.url || seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    const filmTitleLower = filmTitle.toLowerCase();
    const originalTitleLower = (originalTitle || '').toLowerCase();

    // Process and score results
    const editions = uniqueResults.map((result: any) => {
      const url = result.url || '';
      const title = result.title || '';
      const description = result.description || '';
      const combined = `${title} ${description}`.toLowerCase();

      const retailer = FRENCH_RETAILERS.find(r => url.includes(r.domain));
      const format = detectFormat(combined);

      // Extract image from Firecrawl metadata if available
      const image = result.metadata?.ogImage || result.metadata?.image || result.image || null;

      // Relevance scoring
      let score = 0;
      // Title match
      if (combined.includes(filmTitleLower)) score += 10;
      if (originalTitleLower && combined.includes(originalTitleLower)) score += 8;
      // Format priority
      score += (FORMAT_PRIORITY[format] || 0) * 2;
      // Known retailer bonus
      if (retailer) score += 3;
      // Combo editions (Blu-ray + DVD) are usually the most relevant
      if (combined.includes('combo')) score += 5;
      // Has image = likely a real product page
      if (image) score += 2;

      return {
        url,
        title: result.title || filmTitle,
        description: result.description || '',
        retailer: retailer?.name || new URL(url).hostname,
        format,
        image,
        score,
      };
    }).filter((e: any) => e.url);

    // Sort by relevance score descending
    editions.sort((a: any, b: any) => b.score - a.score);

    // Remove score from output
    const cleanEditions = editions.map(({ score, ...rest }: any) => rest);

    console.log(`Found ${cleanEditions.length} French editions`);

    return new Response(
      JSON.stringify({ success: true, editions: cleanEditions }),
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
