import { useQuery } from "@tanstack/react-query";
import { 
  searchFilmVideos, 
  categorizeVideos,
  YouTubeVideo 
} from "@/services/youtube";

export interface CategorizedVideos {
  analysis: YouTubeVideo[];
  behindTheScenes: YouTubeVideo[];
  interviews: YouTubeVideo[];
  reviews: YouTubeVideo[];
  other: YouTubeVideo[];
  all: YouTubeVideo[];
}

export function useFilmVideos(filmTitle: string, year?: number, director?: string) {
  return useQuery<CategorizedVideos, Error>({
    queryKey: ['youtube', 'film-videos', filmTitle, year, director],
    queryFn: async () => {
      const videos = await searchFilmVideos(filmTitle, year, director);
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
