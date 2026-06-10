// TMDB API Service
// API key is public/read-only and safe to include in client-side code
const TMDB_API_KEY = "b89fc45c2067cbd33560270639722eae";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  runtime: number | null;
  genres: { id: number; name: string }[];
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBSearchResult {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSimilarMoviesResponse {
  results: TMDBSearchResult[];
}

// Image URL helpers
export const getImageUrl = (path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getPosterUrl = (path: string | null, size: "w185" | "w342" | "w500" = "w500"): string | null => {
  return getImageUrl(path, size);
};

export const getBackdropUrl = (path: string | null, size: "w780" | "original" = "original"): string | null => {
  return getImageUrl(path, size);
};

export const getProfileUrl = (path: string | null): string | null => {
  return getImageUrl(path, "w185");
};

// API functions
export async function searchMovies(query: string, page = 1): Promise<TMDBSearchResponse> {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovie> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getMovieCredits(movieId: number): Promise<TMDBCredits> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=fr-FR`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getSimilarMovies(movieId: number): Promise<TMDBSimilarMoviesResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getPopularMovies(page = 1): Promise<TMDBSearchResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getNowPlayingMovies(page = 1): Promise<TMDBSearchResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}&region=FR`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBSearchResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export interface TMDBDiscoverParams {
  with_genres?: string;
  with_origin_country?: string;
  "primary_release_date.gte"?: string;
  "primary_release_date.lte"?: string;
  sort_by?: string;
  "vote_count.gte"?: number;
  page?: number;
}

export async function discoverMovies(params: TMDBDiscoverParams): Promise<TMDBSearchResponse> {
  const qs = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "fr-FR",
    include_adult: "false",
    sort_by: params.sort_by ?? "vote_average.desc",
    "vote_count.gte": String(params["vote_count.gte"] ?? 300),
    page: String(params.page ?? 1),
  });
  if (params.with_genres) qs.set("with_genres", params.with_genres);
  if (params.with_origin_country) qs.set("with_origin_country", params.with_origin_country);
  if (params["primary_release_date.gte"]) qs.set("primary_release_date.gte", params["primary_release_date.gte"]);
  if (params["primary_release_date.lte"]) qs.set("primary_release_date.lte", params["primary_release_date.lte"]);

  const response = await fetch(`${TMDB_BASE_URL}/discover/movie?${qs.toString()}`);
  if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
  return response.json();
}

export interface TMDBPersonCreditsResponse {
  cast: Array<TMDBSearchResult & { vote_count: number; job?: string }>;
  crew: Array<TMDBSearchResult & { vote_count: number; job?: string; department?: string }>;
}

export async function getPersonMovieCredits(personId: number): Promise<TMDBPersonCreditsResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/person/${personId}/movie_credits?api_key=${TMDB_API_KEY}&language=fr-FR`
  );
  if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
  return response.json();
}

// Helper to transform TMDB data to our Film interface
export interface Film {
  id: number;
  title: string;
  originalTitle?: string;
  year: number;
  director: string;
  directorId: number;
  synopsis: string;
  genres: string[];
  runtime: number;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number;
  cast: { name: string; character: string; photoUrl: string | null }[];
}

export function transformMovieToFilm(movie: TMDBMovie, credits?: TMDBCredits): Film {
  const director = credits?.crew.find((c) => c.job === "Director");
  const cast = credits?.cast.slice(0, 10).map((c) => ({
    name: c.name,
    character: c.character,
    photoUrl: getProfileUrl(c.profile_path),
  })) || [];

  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    director: director?.name || "Unknown",
    directorId: director?.id || 0,
    synopsis: movie.overview,
    genres: movie.genres?.map((g) => g.name) || [],
    runtime: movie.runtime || 0,
    posterUrl: getPosterUrl(movie.poster_path),
    backdropUrl: getBackdropUrl(movie.backdrop_path),
    rating: movie.vote_average,
    cast,
  };
}

export function transformSearchResultToFilm(result: TMDBSearchResult): Omit<Film, "director" | "directorId" | "genres" | "runtime" | "cast"> & { director: string } {
  return {
    id: result.id,
    title: result.title,
    originalTitle: result.original_title,
    year: result.release_date ? new Date(result.release_date).getFullYear() : 0,
    director: "", // Will be fetched separately if needed
    synopsis: result.overview,
    posterUrl: getPosterUrl(result.poster_path),
    backdropUrl: null,
    rating: result.vote_average,
  };
}
