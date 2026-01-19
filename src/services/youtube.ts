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

export function searchFilmAnalysisVideos(filmTitle: string, year?: number): Promise<YouTubeVideo[]> {
  const yearStr = year ? ` ${year}` : '';
  const queries = [
    `${filmTitle}${yearStr} video essay analysis`,
    `${filmTitle}${yearStr} film analysis breakdown`,
    `${filmTitle}${yearStr} cinematography explained`,
  ];
  
  // Use the first query for now, could randomize or combine results
  return searchYouTubeVideos(queries[0], 6);
}

export function searchFilmDocumentaries(filmTitle: string, year?: number): Promise<YouTubeVideo[]> {
  const yearStr = year ? ` ${year}` : '';
  return searchYouTubeVideos(`${filmTitle}${yearStr} behind the scenes making of documentary`, 6);
}

export function searchFilmInterviews(filmTitle: string, director?: string): Promise<YouTubeVideo[]> {
  const directorStr = director ? ` ${director}` : '';
  return searchYouTubeVideos(`${filmTitle}${directorStr} interview cast director`, 6);
}
