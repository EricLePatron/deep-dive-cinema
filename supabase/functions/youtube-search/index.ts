import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  type?: 'video' | 'channel' | 'playlist';
}

// 7 days fresh cache
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// Serve stale cache up to 30 days when YouTube quota is exhausted
const STALE_FALLBACK_MS = 30 * 24 * 60 * 60 * 1000;

function makeCacheKey(query: string, maxResults: number, type: string): string {
  return `${type}:${maxResults}:${query.trim().toLowerCase()}`;
}

function getSupabase() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  return createClient(url, key);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key not configured');
      throw new Error('YouTube API key not configured');
    }

    const { query, maxResults = 10, type = 'video' } = await req.json() as YouTubeSearchParams;

    if (!query) {
      throw new Error('Query parameter is required');
    }

    const cacheKey = makeCacheKey(query, maxResults, type);
    const sb = getSupabase();

    // 1) Try fresh cache (≤ 7 days)
    if (sb) {
      const { data: cached } = await sb
        .from('youtube_cache')
        .select('payload, expires_at')
        .eq('cache_key', cacheKey)
        .maybeSingle();
      if (cached && new Date(cached.expires_at).getTime() > Date.now()) {
        console.log(`Cache HIT (fresh): ${query}`);
        return new Response(JSON.stringify({ ...(cached.payload as object), cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`Searching YouTube for: ${query}`);

    // Search for videos
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('type', type);
    searchUrl.searchParams.set('maxResults', maxResults.toString());
    searchUrl.searchParams.set('key', YOUTUBE_API_KEY);
    searchUrl.searchParams.set('safeSearch', 'moderate');

    const searchResponse = await fetch(searchUrl.toString());
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('YouTube API error:', errorText);
      // Quota exceeded → return empty list so the UI can degrade gracefully
      // instead of bubbling a 500 that breaks the whole page.
      if (searchResponse.status === 403 && errorText.includes('quota')) {
        console.warn('YouTube quota exceeded — returning empty result set');
        // Try stale cache fallback (≤ 30 days)
        if (sb) {
          const { data: stale } = await sb
            .from('youtube_cache')
            .select('payload, created_at')
            .eq('cache_key', cacheKey)
            .maybeSingle();
          if (stale && Date.now() - new Date(stale.created_at).getTime() < STALE_FALLBACK_MS) {
            console.log(`Cache HIT (stale fallback): ${query}`);
            return new Response(JSON.stringify({ ...(stale.payload as object), cached: true, stale: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        return new Response(JSON.stringify({ videos: [], quotaExceeded: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    // Get video IDs for detailed info
    const videoIds = searchData.items
      .filter((item: any) => item.id.videoId)
      .map((item: any) => item.id.videoId)
      .join(',');

    if (!videoIds) {
      console.log('No videos found');
      const empty = { videos: [] };
      if (sb) {
        await sb.from('youtube_cache').upsert({
          cache_key: cacheKey,
          query,
          payload: empty,
          expires_at: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
          created_at: new Date().toISOString(),
        });
      }
      return new Response(JSON.stringify(empty), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get detailed video info including duration and statistics
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.set('part', 'snippet,contentDetails,statistics');
    videosUrl.searchParams.set('id', videoIds);
    videosUrl.searchParams.set('key', YOUTUBE_API_KEY);

    const videosResponse = await fetch(videosUrl.toString());
    
    if (!videosResponse.ok) {
      const errorText = await videosResponse.text();
      console.error('YouTube Videos API error:', errorText);
      // Quota exceeded on videos.list → fall back to search snippet data
      // (no duration / viewCount, but at least we can show videos).
      if (videosResponse.status === 403 && errorText.includes('quota')) {
        console.warn('YouTube videos.list quota exceeded — falling back to search snippets');
        const fallbackVideos = searchData.items
          .filter((item: any) => item.id.videoId)
          .map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            publishedAt: item.snippet.publishedAt,
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            duration: '10:00', // unknown — assume passes the 5-min filter
            viewCount: 0,
            likeCount: 0,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          }));
        return new Response(JSON.stringify({ videos: fallbackVideos, quotaExceeded: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`YouTube Videos API error: ${videosResponse.status}`);
    }

    const videosData = await videosResponse.json();

    // Transform the data
    const videos = videosData.items.map((video: any) => {
      // Parse duration from ISO 8601 format
      const duration = parseDuration(video.contentDetails.duration);
      
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        publishedAt: video.snippet.publishedAt,
        thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
        duration: duration,
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        url: `https://www.youtube.com/watch?v=${video.id}`,
      };
    });

    console.log(`Found ${videos.length} videos`);

    const payload = { videos };
    if (sb) {
      await sb.from('youtube_cache').upsert({
        cache_key: cacheKey,
        query,
        payload,
        expires_at: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
        created_at: new Date().toISOString(),
      });
    }
    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in youtube-search function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to parse ISO 8601 duration to readable format
function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
