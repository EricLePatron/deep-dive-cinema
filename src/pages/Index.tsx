import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, Video, Headphones, Loader2, TrendingUp, Clapperboard, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { FilmCard } from "@/components/FilmCard";
import { Header } from "@/components/Header";
import { usePopularMovies, useNowPlayingMovies, useTrendingMovies, useSearchMovies } from "@/hooks/useTMDB";
import { useLetterboxdProfile, useLetterboxdFeed } from "@/hooks/useLetterboxd";
import { useSimilarMovies } from "@/hooks/useTMDB";
import { getPosterUrl, getBackdropUrl, searchMovies } from "@/services/tmdb";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const navigate = useNavigate();
  const { data: popularMovies, isLoading: loadingPopular } = usePopularMovies();
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
  const popularFilms = popularMovies?.results.slice(0, 10).map(toFilmCard) || [];

  // Personalized suggestions: based on diary (last month), prioritized by user rating
  const recentRatedFilms = (() => {
    if (!letterboxdFilms) return [];
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return letterboxdFilms
      .filter(f => {
        if (!f.watchedDate) return false;
        return new Date(f.watchedDate) >= oneMonthAgo;
      })
      .sort((a, b) => b.rating - a.rating) // Best rated first
      .slice(0, 8);
  })();

  const recentTitles = recentRatedFilms.map(f => f.filmTitle);

  // Resolve diary films to TMDB entries for poster/id
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

  // Hero spotlight: first now playing film with backdrop
  const spotlight = nowPlaying?.results.find(m => m.backdrop_path)?? null;

  return (
    <div className="dark min-h-screen bg-background safe-top safe-bottom">
      <Header />

      {/* Hero with spotlight film */}
      <section className="relative min-h-[55vh] md:min-h-[85vh] flex items-end pb-6 md:pb-20 px-4 md:px-6 overflow-hidden pt-16 md:pt-20">
        {/* Backdrop */}
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
        {!spotlight && (
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
          </div>
        )}

        <div className="relative z-10 container mx-auto max-w-5xl">
          <div className="flex flex-col gap-3 md:gap-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">
                Explorez l'envers du décor
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl md:text-7xl font-bold text-foreground leading-[1.1] max-w-3xl">
              Plongez au cœur du
              <span className="text-primary cinema-text-glow"> Cinéma</span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Une recherche pour tout découvrir : interviews, making-of, analyses, podcasts et essais vidéo.
            </p>

            {/* Search Bar - prominent */}
            <div className="max-w-2xl w-full">
              <SearchBar onSelectFilm={handleSelectFilm} variant="hero" />
            </div>

            {/* Spotlight film CTA */}
            {spotlight && (
              <button
                onClick={() => navigate(`/film/${spotlight.id}`)}
                className="flex items-center gap-3 group w-fit"
              >
                <div className="w-11 h-[60px] rounded-lg overflow-hidden border border-border/50">
                  <img
                    src={getPosterUrl(spotlight.poster_path, "w185") || ""}
                    alt={spotlight.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs text-primary font-medium uppercase tracking-wider">À l'affiche</p>
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors text-sm md:text-base">
                    {spotlight.title}
                    <ArrowRight className="inline h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Personalized from Letterboxd - FIRST if available */}
      {personalizedFilms && personalizedFilms.length > 0 && (
        <FilmRowSection
          title="Pour vous"
          subtitle="Vos films récents sur Letterboxd — plongez dans le deep dive"
          icon={<Heart className="h-5 w-5 text-primary" />}
          films={personalizedFilms}
          loading={loadingPersonalized}
          initialCount={6}
        />
      )}

      {/* Now Playing */}
      <FilmRowSection
        title="À l'affiche"
        subtitle="Les films actuellement en salle"
        icon={<Clapperboard className="h-5 w-5 text-primary" />}
        films={nowPlayingFilms}
        loading={loadingNowPlaying}
      />

      {/* Trending */}
      <FilmRowSection
        title="Tendances de la semaine"
        subtitle="Les films qui font parler cette semaine"
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        films={trendingFilms}
        loading={loadingTrending}
      />

      {/* Features Preview */}
      <section className="relative py-12 md:py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
              Tout le contexte, <span className="text-primary">au même endroit</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">
              Plus besoin de chercher sur dix plateformes. On agrège tout ce qui vaut la peine d'être vu sur vos films préférés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "Livres & Essais",
                description: "Ouvrages critiques, livres de making-of et essais sur le cinéma.",
              },
              {
                icon: Video,
                title: "Essais Vidéo",
                description: "Les meilleures analyses YouTube, documentaires et contenus behind-the-scenes.",
              },
              {
                icon: Headphones,
                title: "Podcasts & Interviews",
                description: "Conversations approfondies avec réalisateurs, acteurs et critiques.",
              },
            ].map((feature, index) => (
              <div key={index} className="content-card p-5 md:p-6 flex md:flex-col items-center md:text-center gap-4 md:gap-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 md:mx-auto md:mb-4">
                  <feature.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Deep Dives */}
      <FilmRowSection
        title="Deep Dives populaires"
        subtitle="Les films les plus explorés"
        icon={<Star className="h-5 w-5 text-primary" />}
        films={popularFilms}
        loading={loadingPopular}
      />

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 md:py-12 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg md:text-xl font-semibold">
                Deep<span className="text-primary">Dive</span>
              </span>
              <span className="text-muted-foreground text-xs md:text-sm">
                — L'outil ultime d'exploration cinématographique
              </span>
            </div>
            <div className="flex items-center gap-5 text-xs md:text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">À propos</a>
              <a href="#" className="hover:text-foreground transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-foreground transition-colors">CGU</a>
            </div>
          </div>
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
  initialCount,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  films: any[];
  loading: boolean;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const limit = initialCount ?? films.length;
  const visibleFilms = expanded ? films : films.slice(0, limit);
  const hasMore = films.length > limit;

  return (
    <section className="relative py-5 md:py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-5 md:mb-8">
          <div className="flex items-start gap-2.5 md:gap-3">
            <div className="mt-0.5">{icon}</div>
            <div>
              <h2 className="font-display text-xl md:text-3xl font-bold text-foreground mb-0.5">
                {title}
              </h2>
              <p className="text-muted-foreground text-xs md:text-sm">{subtitle}</p>
            </div>
          </div>
          {hasMore && !expanded && (
            <Button variant="cinema-ghost" size="sm" onClick={() => setExpanded(true)} className="gap-1.5 shrink-0 text-xs md:text-sm">
              Voir plus <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="flex gap-3 md:gap-5 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-6 md:px-6 snap-x snap-mandatory scrollbar-hide">
            {visibleFilms.map((film) => (
              <FilmCard key={film.id} film={film} size="md" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Index;
