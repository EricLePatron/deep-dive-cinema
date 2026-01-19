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

// Search for all types of film content in a single, optimized query
export function searchFilmVideos(filmTitle: string, year?: number): Promise<YouTubeVideo[]> {
  const yearStr = year ? ` ${year}` : '';
  // Use a broader query to get diverse content: analysis, making of, interviews, Q&A
  const query = `${filmTitle}${yearStr} film`;
  return searchYouTubeVideos(query, 15);
}

// Categorize videos by type based on title/description keywords
export function categorizeVideos(videos: YouTubeVideo[]): {
  analysis: YouTubeVideo[];
  behindTheScenes: YouTubeVideo[];
  interviews: YouTubeVideo[];
  reviews: YouTubeVideo[];
  other: YouTubeVideo[];
} {
  const analysisKeywords = ['analysis', 'explained', 'breakdown', 'essay', 'meaning', 'symbolism', 'deep dive', 'théorie', 'analyse'];
  const btsKeywords = ['making of', 'behind the scenes', 'bts', 'production', 'how they made', 'vfx', 'special effects', 'documentary', 'coulisses'];
  const interviewKeywords = ['interview', 'q&a', 'qa', 'press', 'talk show', 'cast', 'actor', 'director', 'entrevue', 'conversation'];
  const reviewKeywords = ['review', 'critique', 'reaction', 'opinion', 'thoughts', 'avis', 'critique'];

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
