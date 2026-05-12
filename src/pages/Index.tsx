import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, Compass, BookOpen, Headphones, Film as FilmIcon, Clapperboard } from "lucide-react";
import { FilmCard } from "@/components/FilmCard";
import { DiaryContentHighlights } from "@/components/DiaryContentHighlights";
import { Header } from "@/components/Header";
import { useNowPlayingMovies, useTrendingMovies } from "@/hooks/useTMDB";
import { useLetterboxdProfile, useLetterboxdFeed } from "@/hooks/useLetterboxd";
import { getPosterUrl, getBackdropUrl, searchMovies, getMovieDetails } from "@/services/tmdb";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { SearchBar } from "@/components/SearchBar";
import { useFilmContentStats, isFilmRich } from "@/hooks/useFilmContentStats";
import { SiteFooter } from "@/components/SiteFooter";

const Index = () => {
  const navigate = useNavigate();
  const { data: nowPlaying, isLoading: loadingNowPlaying } = useNowPlayingMovies();
  const { data: trending, isLoading: loadingTrending } = useTrendingMovies('week');
  const { profile, user } = useLetterboxdProfile();
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
  // Pull a wider trending pool because we filter aggressively for editorial fit.
  const trendingPool = trending?.results.slice(0, 30).map(toFilmCard) || [];

  // Fetch cached richness stats for the trending pool and only keep films
  // that already have substantial content in the deep dive cache.
  const { data: trendingStats } = useFilmContentStats(trendingPool.map((f) => f.id));
  const trendingFilms = trendingPool
    .map((f) => ({ ...f, _stats: trendingStats?.get(f.id) ?? null }))
    .filter((f) => isFilmRich(f._stats))
    .slice(0, 10);

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

  const handleSignIn = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
  };

  const handleSelectFilm = (film: { id: number }) => {
    navigate(`/film/${film.id}`);
  };

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

  // Diary-driven spotlight: most recently watched film with a backdrop
  const diarySpotlight = personalizedFilms?.find(f => f.backdropUrl) ?? null;
  const hasDiary = !!personalizedFilms && personalizedFilms.length > 0;

  return (
    <div className="dark min-h-screen bg-background safe-top safe-bottom">
      <Header />

      {/* Hero — diary-driven if available, otherwise editorial value-prop */}
      {hasDiary && diarySpotlight ? (
        <DiaryHero film={diarySpotlight} />
      ) : (
        <ValuePropHero
          isLoggedIn={!!user}
          hasProfile={!!profile}
          onSignIn={handleSignIn}
          onSelectFilm={handleSelectFilm}
        />
      )}

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

      {/* Discovery rows — secondary entry points to start a deep dive */}
      {trendingFilms.length > 0 && (
        <FilmRowSection
          kicker={hasDiary ? "— Pour creuser ailleurs" : "— Pour creuser"}
          title="Tendances avec du contenu"
          subtitle="Films populaires qui ont déjà une vraie matière éditoriale dans Deepdive."
          films={trendingFilms}
          loading={loadingTrending}
        />
      )}

      <FilmRowSection
        kicker="— En salle"
        title="À l'affiche"
        subtitle="Avant ou après la séance, prolongez l'expérience."
        films={nowPlayingFilms}
        loading={loadingNowPlaying}
      />

      {/* Footer */}
      <SiteFooter />
    </div>
  );
};

// Reusable horizontal film row
function FilmRowSection({
  kicker,
  title,
  subtitle,
  films,
  loading,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
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
          {subtitle && (
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl font-light">
              {subtitle}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            {films.map((film) => (
              <FilmCard key={film.id} film={film} size="md" stats={film._stats ?? undefined} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DiaryHero({ film }: { film: any }) {
  return (
    <section className="relative min-h-[70vh] md:min-h-[88vh] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src={film.backdropUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 container mx-auto px-6 pb-12 md:pb-20">
        <div className="max-w-3xl animate-fade-in">
          <div className="editorial-label mb-5">— Votre dernier film</div>
          <Link to={`/film/${film.id}`} className="block group">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] tracking-tight mb-6 group-hover:opacity-85 transition-opacity">
              {film.title}
            </h1>
            <p className="text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed font-light line-clamp-2">
              {film.synopsis}
            </p>
            <div className="mt-6 flex items-center gap-3 editorial-label">
              <span className="tabular-nums">{film.year || ""}</span>
              <span className="text-border">/</span>
              <span>Aller plus loin →</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ValuePropHero({
  isLoggedIn,
  hasProfile,
  onSignIn,
  onSelectFilm,
}: {
  isLoggedIn: boolean;
  hasProfile: boolean;
  onSignIn: () => void;
  onSelectFilm: (film: { id: number }) => void;
}) {
  return (
    <>
    <section className="relative flex items-center overflow-hidden border-b border-border">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-foreground blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="max-w-4xl animate-fade-in">
          <div className="editorial-label mb-6">— Pour les cinéphiles</div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] tracking-tight mb-8">
            Le film est fini.<br />
            <span className="italic text-foreground/70">L'exploration commence.</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl leading-relaxed font-light mb-8">
            Deepdive rassemble tout ce qui se dit, s'écrit et se filme autour des films que vous venez de voir : analyses, podcasts, livres, éditions physiques.
          </p>

          {/* Search CTA */}
          <div className="max-w-2xl mb-10">
            <div className="editorial-label mb-3 text-foreground/60">— Vous venez de voir un film ?</div>
            <SearchBar onSelectFilm={onSelectFilm} variant="hero" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl pt-10 border-t border-border">
            <ValueItem icon={<FilmIcon className="h-4 w-4" />} label="Analyses vidéo" hint="Cinémathèques, vidéo-essais" />
            <ValueItem icon={<Headphones className="h-4 w-4" />} label="Podcasts" hint="Le meilleur de la critique" />
            <ValueItem icon={<BookOpen className="h-4 w-4" />} label="Livres" hint="Essais et entretiens" />
            <ValueItem icon={<Compass className="h-4 w-4" />} label="Éditions physiques" hint="Blu-ray, restaurations" />
          </div>
        </div>
      </div>
      <div id="discover" className="absolute bottom-0" />
    </section>

    {/* Editorial deep dive examples */}
    <EditorialExamples />

    {/* Letterboxd onboarding block */}
    {!hasProfile && (
      <LetterboxdOnboarding isLoggedIn={isLoggedIn} onSignIn={onSignIn} />
    )}
    </>
  );
}

const EDITORIAL_FILMS = [
  { id: 426426, title: "Roma", year: 2018, counts: { videos: 19, podcasts: 15, books: 9 } },
  { id: 466272, title: "Once Upon a Time… in Hollywood", year: 2019, counts: { videos: 17, podcasts: 12, books: 8 } },
  { id: 496243, title: "Parasite", year: 2019, counts: { videos: 24, podcasts: 20, books: 12 } },
];

function EditorialExamples() {
  const { data: films } = useQuery({
    queryKey: ["editorial-films"],
    queryFn: async () => {
      return Promise.all(
        EDITORIAL_FILMS.map(async (f) => {
          try {
            const m = await getMovieDetails(f.id);
            return { ...f, posterUrl: getPosterUrl(m.poster_path, "w500") };
          } catch {
            return { ...f, posterUrl: null };
          }
        })
      );
    },
    staleTime: 1000 * 60 * 60,
  });
  const display = films ?? EDITORIAL_FILMS.map((f) => ({ ...f, posterUrl: null }));
  return (
    <section className="py-14 md:py-20 px-6 border-b border-border">
      <div className="container mx-auto">
        <div className="mb-8 md:mb-10">
          <div className="editorial-label mb-2">— Exemple de deep dive</div>
          <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
            Découvrez ce qui se dit autour d'un film
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {display.map((f) => (
            <Link
              key={f.id}
              to={`/film/${f.id}`}
              className="group block"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-muted mb-4">
                {f.posterUrl && (
                  <img
                    src={f.posterUrl}
                    alt={f.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-display text-xl md:text-2xl text-foreground tracking-tight group-hover:opacity-80 transition-opacity">
                {f.title}
                <span className="text-foreground/50 font-light tabular-nums ml-2">{f.year}</span>
              </h3>
              <p className="editorial-label mt-2 text-foreground/60">
                {f.counts.videos} vidéos · {f.counts.podcasts} podcasts · {f.counts.books} livres
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LetterboxdOnboarding({ isLoggedIn, onSignIn }: { isLoggedIn: boolean; onSignIn: () => void }) {
  return (
    <section className="py-12 md:py-16 px-6">
      <div className="container mx-auto">
        <div className="max-w-2xl mx-auto border border-border bg-foreground/[0.03] rounded-sm p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground/70 shrink-0">
              <Clapperboard className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl md:text-2xl text-foreground tracking-tight mb-2">
                Vous avez un compte Letterboxd ?
              </h3>
              <p className="text-sm md:text-base text-foreground/70 font-light leading-relaxed mb-5">
                Connectez-le pour voir votre diary et vos films récents directement ici, avec leurs analyses, podcasts et livres associés.
              </p>
              {!isLoggedIn ? (
                <Button onClick={onSignIn} className="group">
                  Connecter Letterboxd
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
              ) : (
                <p className="editorial-label text-foreground/60">
                  Reliez votre compte depuis l'icône Letterboxd dans la barre du haut.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueItem({ icon, label, hint }: { icon: React.ReactNode; label: string; hint: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-foreground mb-1.5">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground font-light">{hint}</p>
    </div>
  );
}

export default Index;
