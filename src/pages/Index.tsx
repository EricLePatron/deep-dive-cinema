import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { FilmCard } from "@/components/FilmCard";
import { DiaryContentHighlights } from "@/components/DiaryContentHighlights";
import { Header } from "@/components/Header";
import { useNowPlayingMovies, useTrendingMovies } from "@/hooks/useTMDB";
import { useLetterboxdProfile, useLetterboxdFeed } from "@/hooks/useLetterboxd";
import { getPosterUrl, getBackdropUrl, searchMovies, getMovieDetails } from "@/services/tmdb";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { data: nowPlaying, isLoading: loadingNowPlaying } = useNowPlayingMovies();
  const { data: trending, isLoading: loadingTrending } = useTrendingMovies('week');
  const { profile } = useLetterboxdProfile();
  const { data: letterboxdFilms } = useLetterboxdFeed(profile?.username);

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

  // Personalized: most recently watched diary films, true chronological order
  const recentRatedFilms = (() => {
    if (!letterboxdFilms) return [];
    return [...letterboxdFilms]
      .sort((a, b) => {
        const da = new Date(a.watchedDate || a.pubDate || 0).getTime();
        const db = new Date(b.watchedDate || b.pubDate || 0).getTime();
        return db - da;
      })
      .slice(0, 8);
  })();

  const recentKey = recentRatedFilms.map(f => `${f.tmdbMovieId ?? f.filmTitle}:${f.watchedDate}`).join("|");

  const { data: personalizedFilms, isLoading: loadingPersonalized } = useQuery({
    queryKey: ["personalized-diary", recentKey],
    queryFn: async () => {
      const results: any[] = [];
      const seen = new Set<number>();
      for (const film of recentRatedFilms) {
        let match: any = null;
        if (film.tmdbMovieId && !seen.has(film.tmdbMovieId)) {
          try {
            match = await getMovieDetails(film.tmdbMovieId);
          } catch {
            match = null;
          }
        }
        if (!match) {
          const search = await searchMovies(film.filmTitle);
          match = search.results.find(
            (m: any) => m.release_date?.startsWith(film.filmYear)
          ) || search.results[0];
        }
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
    staleTime: 1000 * 60 * 5,
  });

  // Hero spotlight
  const spotlight = nowPlaying?.results.find(m => m.backdrop_path) ?? null;

  return (
    <div className="dark min-h-screen bg-background safe-top safe-bottom">
      <Header />

      {/* Hero éditorial — MUBI Notebook style */}
      <section className="relative min-h-[70vh] md:min-h-[88vh] flex items-end overflow-hidden">
        {spotlight && (
          <div className="absolute inset-0">
            <img
              src={getBackdropUrl(spotlight.backdrop_path) || ""}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
          </div>
        )}

        <div className="relative z-10 container mx-auto px-6 pb-12 md:pb-20">
          <div className="max-w-3xl animate-fade-in">
            <div className="editorial-label mb-5">— À l'affiche</div>
            {spotlight ? (
              <Link to={`/film/${spotlight.id}`} className="block group">
                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] tracking-tight mb-6 group-hover:opacity-85 transition-opacity">
                  {spotlight.title}
                </h1>
                <p className="text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed font-light line-clamp-2">
                  {spotlight.overview}
                </p>
                <div className="mt-6 flex items-center gap-3 editorial-label">
                  <span className="tabular-nums">
                    {spotlight.release_date ? new Date(spotlight.release_date).getFullYear() : ""}
                  </span>
                  <span className="text-border">/</span>
                  <span>Découvrir →</span>
                </div>
              </Link>
            ) : (
              <h1 className="font-display text-5xl md:text-7xl text-foreground leading-[0.95] tracking-tight">
                Le cinéma, en profondeur.
              </h1>
            )}
          </div>
        </div>
      </section>

      {/* 1. Diary films */}
      {personalizedFilms && personalizedFilms.length > 0 && (
        <FilmRowSection
          kicker="— Votre diary"
          title="Vos derniers films"
          films={personalizedFilms}
          loading={false}
        />
      )}
      {loadingPersonalized && recentRatedFilms.length > 0 && (
        <section className="py-10 px-6">
          <div className="container mx-auto flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          </div>
        </section>
      )}

      {/* 2. Content highlights from diary */}
      {personalizedFilms && personalizedFilms.length > 0 && (
        <DiaryContentHighlights films={personalizedFilms} />
      )}

      {/* 3. Now Playing */}
      <FilmRowSection
        kicker="— En salle"
        title="À l'affiche"
        films={nowPlayingFilms}
        loading={loadingNowPlaying}
      />

      {/* 4. Trending */}
      <FilmRowSection
        kicker="— Cette semaine"
        title="Tendances"
        films={trendingFilms}
        loading={loadingTrending}
      />

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-10 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <span className="font-display text-xl">Deep<span className="italic">dive</span></span>
          <span className="editorial-label">© 2025</span>
        </div>
      </footer>
    </div>
  );
};

// Reusable horizontal film row
function FilmRowSection({
  kicker,
  title,
  films,
  loading,
}: {
  kicker: string;
  title: string;
  films: any[];
  loading: boolean;
}) {
  return (
    <section className="relative py-10 md:py-14 px-6">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="editorial-label mb-2">{kicker}</div>
          <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
            {title}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
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
