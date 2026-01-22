import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PodcastSearchParams {
  query: string;
  maxResults?: number;
}

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  podcastName: string;
  podcastAuthor: string;
  episodeUrl: string;
  audioUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  publishedAt: string;
  podcastId: string;
}

// Format duration from seconds to readable string
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}

// Search podcasts using iTunes Search API
async function searchITunesPodcasts(query: string, limit: number = 20): Promise<PodcastEpisode[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://itunes.apple.com/search?term=${encodedQuery}&media=podcast&entity=podcastEpisode&limit=${limit}&country=fr`;
  
  console.log('Searching iTunes podcasts:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error('iTunes API error:', response.status, response.statusText);
    throw new Error(`iTunes API error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`Found ${data.resultCount} podcast episodes`);
  
  return data.results.map((item: any) => ({
    id: `itunes-${item.trackId}`,
    title: item.trackName || 'Untitled Episode',
    description: item.description || item.shortDescription || '',
    podcastName: item.collectionName || 'Unknown Podcast',
    podcastAuthor: item.artistName || '',
    episodeUrl: item.trackViewUrl || item.collectionViewUrl || '',
    audioUrl: item.episodeUrl || '',
    thumbnailUrl: item.artworkUrl600 || item.artworkUrl160 || item.artworkUrl60 || '',
    duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : 0,
    publishedAt: item.releaseDate || '',
    podcastId: String(item.collectionId),
  }));
}

// Search for podcast shows (not episodes) to find relevant podcasts
async function searchITunesPodcastShows(query: string, limit: number = 10): Promise<any[]> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://itunes.apple.com/search?term=${encodedQuery}&media=podcast&entity=podcast&limit=${limit}&country=fr`;
  
  console.log('Searching iTunes podcast shows:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error('iTunes API error:', response.status, response.statusText);
    return [];
  }
  
  const data = await response.json();
  return data.results || [];
}

// Priority French podcast sources for cinema
const frenchCinemaPodcasts = [
  'france culture cinéma',
  'france inter cinéma',
  'le masque et la plume',
  'la dispute cinéma',
  'le cercle canal+',
  'blow up arte',
  'les chemins de la philosophie',
  'la grande table',
  'affranchis cinéma',
  'plan large',
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 20 }: PodcastSearchParams = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Podcast search for: "${query}"`);

    // Search for episodes with the film title
    const filmQuery = `${query} film`;
    const episodes = await searchITunesPodcasts(filmQuery, maxResults);
    
    // Also search French cinema podcast sources specifically
    const frenchQueries = [
      `${query} france culture`,
      `${query} france inter`,
      `${query} cinéma critique`,
    ];
    
    const additionalEpisodes: PodcastEpisode[] = [];
    
    for (const frQuery of frenchQueries) {
      try {
        const frEpisodes = await searchITunesPodcasts(frQuery, 5);
        additionalEpisodes.push(...frEpisodes);
      } catch (e) {
        console.warn(`Failed to search for: ${frQuery}`, e);
      }
    }
    
    // Merge and deduplicate results
    const allEpisodes = [...episodes, ...additionalEpisodes];
    const uniqueEpisodes = allEpisodes.filter((episode, index, self) => 
      index === self.findIndex(e => e.id === episode.id)
    );
    
    // Score and sort episodes by relevance
    const scoredEpisodes = uniqueEpisodes.map(episode => {
      let score = 0;
      const titleLower = episode.title.toLowerCase();
      const podcastLower = episode.podcastName.toLowerCase();
      const authorLower = episode.podcastAuthor.toLowerCase();
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(' ');
      
      // Title contains query words
      queryWords.forEach(word => {
        if (word.length > 2 && titleLower.includes(word)) score += 10;
      });
      
      // French cinema sources get priority
      if (podcastLower.includes('france culture') || authorLower.includes('radio france')) score += 30;
      if (podcastLower.includes('france inter')) score += 25;
      if (podcastLower.includes('arte') || podcastLower.includes('blow up')) score += 25;
      if (podcastLower.includes('masque et la plume') || podcastLower.includes('dispute')) score += 20;
      if (podcastLower.includes('cercle') || podcastLower.includes('canal+')) score += 15;
      
      // Cinema-related keywords
      const cinemaKeywords = ['cinéma', 'film', 'réalisateur', 'acteur', 'critique', 'analyse', 'cinema', 'movie'];
      cinemaKeywords.forEach(kw => {
        if (titleLower.includes(kw) || podcastLower.includes(kw)) score += 5;
      });
      
      // Duration bonus (longer = more in-depth)
      if (episode.duration > 3600) score += 10; // > 1h
      else if (episode.duration > 1800) score += 7; // > 30min
      else if (episode.duration > 600) score += 3; // > 10min
      
      return { ...episode, score };
    });
    
    // Sort by score (highest first) and limit results
    scoredEpisodes.sort((a, b) => b.score - a.score);
    const topEpisodes = scoredEpisodes.slice(0, maxResults);
    
    // Format for frontend
    const formattedEpisodes = topEpisodes.map(ep => ({
      ...ep,
      durationFormatted: formatDuration(ep.duration),
      isRadioFrance: ep.podcastName.toLowerCase().includes('france') || 
                     ep.podcastAuthor.toLowerCase().includes('radio france'),
    }));

    console.log(`Returning ${formattedEpisodes.length} podcast episodes`);

    return new Response(
      JSON.stringify({ episodes: formattedEpisodes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search podcasts';
    console.error('Podcast search error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
