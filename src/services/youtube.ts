import { supabase } from "@/integrations/supabase/client";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  url: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  error?: string;
}

export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  const { data, error } = await supabase.functions.invoke('youtube-search', {
    body: { query, maxResults, type: 'video' },
  });

  if (error) {
    console.error('Error calling youtube-search function:', error);
    throw new Error(error.message || 'Failed to search YouTube videos');
  }

  if (data.error) {
    console.error('YouTube search error:', data.error);
    throw new Error(data.error);
  }

  return data.videos || [];
}

// Keywords to EXCLUDE - trailers, marketing, promotional content
const excludeKeywords = [
  'trailer', 'teaser', 'bande annonce', 'bande-annonce', 
  'promo', 'promotional', 'tv spot', 'spot tv',
  'official clip', 'movie clip', 'extrait officiel',
  'first look', 'sneak peek', 'avant-première',
  'red carpet', 'tapis rouge', 'premiere', 'première',
  'fan reaction', 'audience reaction',
  'rank', 'ranking', 'top 10', 'top 5', 'tier list',
  'honest trailer', 'pitch meeting', 'everything wrong'
];

// Filter out low-quality/marketing content
function isHighQualityContent(video: YouTubeVideo): boolean {
  const titleLower = video.title.toLowerCase();
  const descLower = video.description.toLowerCase();
  const combined = titleLower + ' ' + descLower;
  
  // Exclude if contains marketing keywords
  if (excludeKeywords.some(kw => combined.includes(kw))) {
    return false;
  }
  
  // Prefer longer videos (usually more in-depth) - at least 5 minutes
  const durationParts = video.duration.split(':').map(Number);
  let totalMinutes = 0;
  if (durationParts.length === 3) {
    totalMinutes = durationParts[0] * 60 + durationParts[1];
  } else if (durationParts.length === 2) {
    totalMinutes = durationParts[0];
  }
  
  // Filter out very short videos (likely clips/trailers)
  if (totalMinutes < 3) {
    return false;
  }
  
  return true;
}

// Search for all types of film content in a single, optimized query
export async function searchFilmVideos(filmTitle: string, year?: number): Promise<YouTubeVideo[]> {
  const yearStr = year ? ` ${year}` : '';
  // Use cinephile-focused query terms
  const query = `${filmTitle}${yearStr} analysis OR interview OR making of OR behind the scenes`;
  const videos = await searchYouTubeVideos(query, 25);
  
  // Filter for high-quality content only
  return videos.filter(isHighQualityContent);
}

// Categorize videos by type based on title/description keywords
export function categorizeVideos(videos: YouTubeVideo[]): {
  analysis: YouTubeVideo[];
  behindTheScenes: YouTubeVideo[];
  interviews: YouTubeVideo[];
  reviews: YouTubeVideo[];
  other: YouTubeVideo[];
} {
  const analysisKeywords = ['analysis', 'explained', 'breakdown', 'essay', 'meaning', 'symbolism', 'deep dive', 'théorie', 'analyse', 'décryptage', 'philosophy', 'themes', 'cinematography', 'directing'];
  const btsKeywords = ['making of', 'behind the scenes', 'bts', 'production', 'how they made', 'vfx', 'special effects', 'documentary', 'coulisses', 'fabrication', 'tournage'];
  const interviewKeywords = ['interview', 'q&a', 'qa', 'press junket', 'talk show', 'cast interview', 'director interview', 'entrevue', 'conversation with', 'discusses', 'talks about'];
  const reviewKeywords = ['critique', 'review in-depth', 'film analysis', 'retrospective', 'avis détaillé'];

  const categorized = {
    analysis: [] as YouTubeVideo[],
    behindTheScenes: [] as YouTubeVideo[],
    interviews: [] as YouTubeVideo[],
    reviews: [] as YouTubeVideo[],
    other: [] as YouTubeVideo[],
  };

  for (const video of videos) {
    const titleLower = video.title.toLowerCase();
    const descLower = video.description.toLowerCase();
    const combined = titleLower + ' ' + descLower;

    if (analysisKeywords.some(kw => combined.includes(kw))) {
      categorized.analysis.push(video);
    } else if (btsKeywords.some(kw => combined.includes(kw))) {
      categorized.behindTheScenes.push(video);
    } else if (interviewKeywords.some(kw => combined.includes(kw))) {
      categorized.interviews.push(video);
    } else if (reviewKeywords.some(kw => combined.includes(kw))) {
      categorized.reviews.push(video);
    } else {
      categorized.other.push(video);
    }
  }

  return categorized;
}
