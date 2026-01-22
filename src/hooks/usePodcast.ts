import { useQuery } from "@tanstack/react-query";
import { searchFilmPodcasts, PodcastEpisode } from "@/services/podcast";

export function useFilmPodcasts(filmTitle: string, director?: string) {
  return useQuery<PodcastEpisode[], Error>({
    queryKey: ['podcasts', 'film', filmTitle, director],
    queryFn: () => searchFilmPodcasts(filmTitle, director, 15),
    enabled: !!filmTitle,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}
