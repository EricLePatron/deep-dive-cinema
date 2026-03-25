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

    // Build multiple search queries: French title first, then original title if different
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
        continue; // Try next title instead of failing
      }

      allResults.push(...(data.data || []));
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    const data = { data: allResults.filter((r: any) => {
      if (!r.url || seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    })};

    // Process results: identify retailer and format
    const editions = (data.data || []).map((result: any) => {
      const url = result.url || '';
      const title = result.title || '';
      const description = result.description || '';
      const combined = `${title} ${description}`.toLowerCase();

      // Detect retailer
      const retailer = FRENCH_RETAILERS.find(r => url.includes(r.domain));

      // Detect format
      let format = 'DVD';
      if (combined.includes('4k') || combined.includes('uhd')) format = '4K UHD';
      else if (combined.includes('blu-ray') || combined.includes('bluray') || combined.includes('blu ray')) format = 'Blu-ray';
      else if (combined.includes('steelbook') || combined.includes('collector') || combined.includes('coffret')) format = 'Collector';

      return {
        url,
        title: result.title || filmTitle,
        description: result.description || '',
        retailer: retailer?.name || new URL(url).hostname,
        format,
      };
    }).filter((e: any) => e.url);

    console.log(`Found ${editions.length} French editions`);

    return new Response(
      JSON.stringify({ success: true, editions }),
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
