import { useQuery } from "@tanstack/react-query";
import { 
  searchFilmAnalysisVideos, 
  searchFilmDocumentaries, 
  searchFilmInterviews,
  YouTubeVideo 
} from "@/services/youtube";

export function useFilmAnalysisVideos(filmTitle: string, year?: number) {
  return useQuery<YouTubeVideo[], Error>({
    queryKey: ['youtube', 'analysis', filmTitle, year],
    queryFn: () => searchFilmAnalysisVideos(filmTitle, year),
    enabled: !!filmTitle,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}

export function useFilmDocumentaries(filmTitle: string, year?: number) {
  return useQuery<YouTubeVideo[], Error>({
    queryKey: ['youtube', 'documentaries', filmTitle, year],
    queryFn: () => searchFilmDocumentaries(filmTitle, year),
    enabled: !!filmTitle,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

export function useFilmInterviews(filmTitle: string, director?: string) {
  return useQuery<YouTubeVideo[], Error>({
    queryKey: ['youtube', 'interviews', filmTitle, director],
    queryFn: () => searchFilmInterviews(filmTitle, director),
    enabled: !!filmTitle,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}
