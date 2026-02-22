import { useQuery } from "@tanstack/react-query";
import {
  searchMovies,
  getMovieDetails,
  getMovieCredits,
  getSimilarMovies,
  getPopularMovies,
  getNowPlayingMovies,
  getTrendingMovies,
  transformMovieToFilm,
  TMDBSearchResponse,
  TMDBCredits,
  Film,
} from "@/services/tmdb";

// Search movies hook
export function useSearchMovies(query: string, enabled = true) {
  return useQuery({
    queryKey: ["tmdb", "search", query],
    queryFn: () => searchMovies(query),
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

// Get movie details with credits
export function useMovieDetails(movieId: number | undefined) {
  return useQuery({
    queryKey: ["tmdb", "movie", movieId],
    queryFn: async (): Promise<Film> => {
      if (!movieId) throw new Error("Movie ID is required");
      const [movie, credits] = await Promise.all([
        getMovieDetails(movieId),
        getMovieCredits(movieId),
      ]);
      return transformMovieToFilm(movie, credits);
    },
    enabled: !!movieId,
    staleTime: 1000 * 60 * 10,
  });
}

// Get similar movies
export function useSimilarMovies(movieId: number | undefined) {
  return useQuery({
    queryKey: ["tmdb", "similar", movieId],
    queryFn: async () => {
      if (!movieId) throw new Error("Movie ID is required");
      return getSimilarMovies(movieId);
    },
    enabled: !!movieId,
    staleTime: 1000 * 60 * 10,
  });
}

// Get popular movies
export function usePopularMovies(page = 1) {
  return useQuery({
    queryKey: ["tmdb", "popular", page],
    queryFn: () => getPopularMovies(page),
    staleTime: 1000 * 60 * 5,
  });
}

// Get now playing movies
export function useNowPlayingMovies(page = 1) {
  return useQuery({
    queryKey: ["tmdb", "now-playing", page],
    queryFn: () => getNowPlayingMovies(page),
    staleTime: 1000 * 60 * 5,
  });
}

// Get trending movies
export function useTrendingMovies(timeWindow: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: ["tmdb", "trending", timeWindow],
    queryFn: () => getTrendingMovies(timeWindow),
    staleTime: 1000 * 60 * 5,
  });
}
