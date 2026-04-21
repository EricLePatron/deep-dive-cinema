import { useQuery } from "@tanstack/react-query";
import { 
  searchFilmVideos, 
  categorizeVideos,
  YouTubeVideo 
} from "@/services/youtube";

export interface CategorizedVideos {
  /** Tournage, making-of, BTS, interviews acteurs/réalisateurs/équipe */
  production: YouTubeVideo[];
  /** Analyses, présentations, masterclass, Q&A, vidéos-essais (style cinémathèque) */
  editorial: YouTubeVideo[];
  all: YouTubeVideo[];
}

export function useFilmVideos(filmTitle: string, year?: number, director?: string, originalTitle?: string) {
  return useQuery<CategorizedVideos, Error>({
    queryKey: ['youtube', 'film-videos', filmTitle, year, director, originalTitle],
    queryFn: async () => {
      const videos = await searchFilmVideos(filmTitle, year, director, originalTitle);
      const categorized = categorizeVideos(videos);
      return {
        ...categorized,
        all: videos,
      };
    },
    enabled: !!filmTitle,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
