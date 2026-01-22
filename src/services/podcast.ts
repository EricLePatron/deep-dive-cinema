import { supabase } from "@/integrations/supabase/client";

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  podcastName: string;
  podcastAuthor: string;
  episodeUrl: string;
  audioUrl: string;
  thumbnailUrl: string;
  duration: number;
  durationFormatted: string;
  publishedAt: string;
  podcastId: string;
  isRadioFrance: boolean;
}

export interface PodcastSearchResponse {
  episodes: PodcastEpisode[];
  error?: string;
}

export async function searchFilmPodcasts(
  filmTitle: string,
  director?: string,
  maxResults: number = 15
): Promise<PodcastEpisode[]> {
  // Build search query with film title and optionally director
  const query = director ? `${filmTitle} ${director}` : filmTitle;
  
  console.log('Searching podcasts for:', query);
  
  const { data, error } = await supabase.functions.invoke('podcast-search', {
    body: { query, maxResults },
  });

  if (error) {
    console.error('Error calling podcast-search function:', error);
    throw new Error(error.message || 'Failed to search podcasts');
  }

  if (data.error) {
    console.error('Podcast search error:', data.error);
    throw new Error(data.error);
  }

  return data.episodes || [];
}

// Format date for display
export function formatPodcastDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Il y a ${months} mois`;
    } else {
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    }
  } catch {
    return dateStr;
  }
}
