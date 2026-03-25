import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Loader2, TrendingUp, Clapperboard, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { FilmCard } from "@/components/FilmCard";
import { DiaryContentHighlights } from "@/components/DiaryContentHighlights";
import { Header } from "@/components/Header";
import { useNowPlayingMovies, useTrendingMovies, useSearchMovies } from "@/hooks/useTMDB";
import { useLetterboxdProfile, useLetterboxdFeed } from "@/hooks/useLetterboxd";
import { getPosterUrl, getBackdropUrl, searchMovies } from "@/services/tmdb";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const navigate = useNavigate();
  const { data: nowPlaying, isLoading: loadingNowPlaying } = useNowPlayingMovies();
  const { data: trending, isLoading: loadingTrending } = useTrendingMovies('week');
  const { profile } = useLetterboxdProfile();
  const { data: letterboxdFilms } = useLetterboxdFeed(profile?.username);

  const handleSelectFilm = (film: { id: number; title: string }) => {
    navigate(`/film/${film.id}`);
  };

  const toFilmCard = (movie: any) => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    director: "",
    directorId: 0,
    synopsis: movie.overview,
    genres: [],
    runtime: 0,
    posterUrl: getPosterUrl(movie.poster_path) || "",
    backdropUrl: getBackdropUrl(movie.backdrop_path),
    rating: movie.vote_average,
    cast: [],
  });

  const nowPlayingFilms = nowPlaying?.results.slice(0, 10).map(toFilmCard) || [];
  const trendingFilms = trending?.results.slice(0, 10).map(toFilmCard) || [];

  // Personalized: recent diary films resolved to TMDB
  const recentRatedFilms = (() => {
    if (!letterboxdFilms) return [];
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return letterboxdFilms
      .filter(f => f.watchedDate && new Date(f.watchedDate) >= oneMonthAgo)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  })();

  const recentTitles = recentRatedFilms.map(f => f.filmTitle);

  const { data: personalizedFilms, isLoading: loadingPersonalized } = useQuery({
    queryKey: ["personalized-diary", recentTitles],
    queryFn: async () => {
      const results: any[] = [];
      const seen = new Set<number>();
      for (const film of recentRatedFilms) {
        const search = await searchMovies(film.filmTitle);
        const match = search.results.find(
          (m: any) => m.release_date?.startsWith(film.filmYear)
        ) || search.results[0];
        if (match && !seen.has(match.id)) {
          seen.add(match.id);
          results.push({
            ...toFilmCard(match),
            _userRating: film.rating,
            _watchedDate: film.watchedDate,
          });
        }
      }
      return results;
    },
    enabled: recentRatedFilms.length > 0,
    staleTime: 1000 * 60 * 15,
  });

  // Hero spotlight
  const spotlight = nowPlaying?.results.find(m => m.backdrop_path) ?? null;

  return (
    <div className="dark min-h-screen bg-background safe-top safe-bottom">
      <Header />

      {/* Hero – compact */}
      <section className="relative min-h-[45vh] md:min-h-[70vh] flex items-end pb-6 md:pb-16 px-4 md:px-6 overflow-hidden pt-16 md:pt-20">
        {spotlight && (
          <div className="absolute inset-0">
            <img
              src={getBackdropUrl(spotlight.backdrop_path) || ""}
              alt=""
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
          </div>
        )}

        <div className="relative z-10 container mx-auto max-w-5xl">
          <div className="flex flex-col gap-3 md:gap-6">
            <h1 className="font-display text-3xl md:text-6xl font-bold text-foreground leading-[1.1] max-w-3xl">
              Plongez au cœur du
              <span className="text-primary cinema-text-glow"> Cinéma</span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Interviews, making-of, analyses et podcasts sur vos films préférés.
            </p>
            <div className="max-w-xl w-full">
              <SearchBar onSelectFilm={handleSelectFilm} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* 1. Diary films – shown first */}
      {personalizedFilms && personalizedFilms.length > 0 && (
        <FilmRowSection
          title="Vos derniers films"
          subtitle="Basé sur votre diary Letterboxd"
          icon={<Heart className="h-5 w-5 text-primary" />}
          films={personalizedFilms}
          loading={false}
        />
      )}
      {loadingPersonalized && recentRatedFilms.length > 0 && (
        <section className="py-5 md:py-10 px-4 md:px-6">
          <div className="container mx-auto flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </section>
      )}

      {/* 2. Content highlights from diary */}
      {personalizedFilms && personalizedFilms.length > 0 && (
        <DiaryContentHighlights films={personalizedFilms} />
      )}

      {/* 3. Now Playing */}
      <FilmRowSection
        title="À l'affiche"
        subtitle="En salle actuellement"
        icon={<Clapperboard className="h-5 w-5 text-primary" />}
        films={nowPlayingFilms}
        loading={loadingNowPlaying}
      />

      {/* 4. Trending */}
      <FilmRowSection
        title="Tendances"
        subtitle="Les films du moment"
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        films={trendingFilms}
        loading={loadingTrending}
      />

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 md:px-6">
        <div className="container mx-auto flex items-center justify-between">
          <span className="font-display text-lg font-semibold">
            Deep<span className="text-primary">Dive</span>
          </span>
          <span className="text-muted-foreground text-xs">© 2025</span>
        </div>
      </footer>
    </div>
  );
};

// Reusable horizontal film row
function FilmRowSection({
  title,
  subtitle,
  icon,
  films,
  loading,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  films: any[];
  loading: boolean;
}) {
  return (
    <section className="relative py-5 md:py-10 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex items-start gap-2.5 md:gap-3 mb-4 md:mb-6">
          <div className="mt-0.5">{icon}</div>
          <div>
            <h2 className="font-display text-lg md:text-2xl font-bold text-foreground mb-0.5">
              {title}
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm">{subtitle}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="flex gap-3 md:gap-5 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6 snap-x snap-mandatory scrollbar-hide">
            {films.map((film) => (
              <FilmCard key={film.id} film={film} size="md" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Index;
