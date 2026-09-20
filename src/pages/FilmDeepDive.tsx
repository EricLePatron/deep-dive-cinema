import { useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  User,
  Book,
  Video,
  Play,
  Headphones,
  FileText,
  Mic,
  Bookmark,
  Share2,
  Disc3,
  ChevronRight,
  Loader2,
  Film,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { FilmCard } from "@/components/FilmCard";
import { BookCard } from "@/components/BookCard";
import { YouTubeVideoCard } from "@/components/YouTubeVideoCard";
import { PodcastCard } from "@/components/PodcastCard";
import { useMovieDetails, useSimilarMovies } from "@/hooks/useTMDB";
import { useFilmVideos } from "@/hooks/useYouTube";
import { useFilmPodcasts } from "@/hooks/usePodcast";
import { useLetterboxdProfile, useLetterboxdFeed } from "@/hooks/useLetterboxd";
import { getPosterUrl } from "@/services/tmdb";
import { mockArticles } from "@/data/mockData";
import { useFilmBooks } from "@/hooks/useFilmBooks";
import { useFilmArticles } from "@/hooks/useFilmArticles";
import { ArticleCard } from "@/components/ArticleCard";
import { cn } from "@/lib/utils";
import { PhysicalMediaSection } from "@/components/PhysicalMediaSection";
import { useUpsertFilmContentStats } from "@/hooks/useFilmContentStats";
import { FilmSEO } from "@/components/FilmSEO";

interface SectionHeaderProps {
  title: string;
  count?: number;
  onViewAll?: () => void;
}

function SectionHeader({ title, count, onViewAll }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-border">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-2xl text-foreground tracking-tight">
          {title}
        </h2>
        {count !== undefined && count > 0 && (
          <span className="editorial-label tabular-nums">{count}</span>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="editorial-label hover:text-foreground transition-colors flex items-center gap-1 group"
        >
          Voir tout
          <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
    </div>
  );
}

function EmptyState({ message, subMessage }: { message: string; subMessage?: string }) {
  return (
    <div className="py-6">
      <p className="text-sm text-muted-foreground/70">{message}</p>
      {subMessage && <p className="text-xs text-muted-foreground/50 mt-1">{subMessage}</p>}
    </div>
  );
}

// Densité par défaut des onglets dédiés : on affiche une première page, puis
// « Charger plus » à la demande — au lieu d'un mur illimité de cartes.
const TAB_PAGE = 9;

function PaginatedGrid<T>({
  items,
  className,
  renderItem,
}: {
  items: T[];
  className?: string;
  renderItem: (item: T) => JSX.Element;
}) {
  const [visible, setVisible] = useState(TAB_PAGE);
  const remaining = items.length - visible;
  return (
    <>
      <div className={className}>{items.slice(0, visible).map(renderItem)}</div>
      {remaining > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + TAB_PAGE)}
            className="editorial-label flex items-center gap-2 rounded-full border border-border px-5 py-2.5 transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            Charger plus
            <span className="tabular-nums text-muted-foreground">{remaining}</span>
          </button>
        </div>
      )}
    </>
  );
}

export default function FilmDeepDive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const movieId = id ? parseInt(id, 10) : undefined;
  const { data: film, isLoading, error } = useMovieDetails(movieId);
  const { data: similarMoviesData, isLoading: loadingSimilar } = useSimilarMovies(movieId);

  const filmTitle = film?.title || "";
  const filmYear = film?.year;
  const filmDirector = film?.director || "";
  const filmCtx = film ? { tmdbId: film.id, title: film.title, posterUrl: film.posterUrl, year: film.year } : undefined;

  const { data: rawVideos, isLoading: loadingVideos } = useFilmVideos(filmTitle, filmYear, filmDirector, film?.originalTitle);
  // Feedback (thumbs up/down) is logged for analytics only; it no longer alters
  // the live ranking or visibility of videos.
  const videos = rawVideos;
  const { data: podcasts, isLoading: loadingPodcasts } = useFilmPodcasts(filmTitle, filmDirector);

  const { data: books, isLoading: loadingBooks } = useFilmBooks(
    filmTitle, film?.originalTitle, filmDirector, film?.genres
  );

  const { data: articles, isLoading: loadingArticles } = useFilmArticles(
    filmTitle, filmYear, film?.originalTitle, filmDirector
  );

  const { profile } = useLetterboxdProfile();
  const { data: letterboxdFilms } = useLetterboxdFeed(profile?.username);
  const letterboxdEntry = letterboxdFilms?.find(
    (f) => f.filmTitle.toLowerCase() === filmTitle.toLowerCase()
  );

  const totalBooks = books?.length || 0;
  const totalProduction = videos?.production.length || 0;
  const totalEditorial = videos?.editorial.length || 0;
  const totalPodcasts = podcasts?.length || 0;
  const totalArticles = articles?.length || 0;

  // "Pour commencer" : une seule recommandation, tous formats confondus.
  const bestVideo = videos?.editorial?.[0] ?? videos?.production?.[0] ?? null;
  type Lead = { kicker: string; metaShort?: string; title: string; meta: string; href: string; thumb?: string | null };
  const lead: Lead | null = bestVideo
    ? {
        kicker: videos?.editorial?.[0] ? "Vidéo-essai" : "Autour du tournage",
        metaShort: bestVideo.duration,
        title: bestVideo.title,
        meta: bestVideo.channelTitle,
        href: bestVideo.url,
        thumb: bestVideo.thumbnailUrl,
      }
    : articles?.[0]
    ? {
        kicker: "À lire",
        title: articles[0].title,
        meta: articles[0].source,
        href: articles[0].url,
        thumb: articles[0].image,
      }
    : podcasts?.[0]
    ? {
        kicker: "À écouter",
        metaShort: podcasts[0].durationFormatted,
        title: podcasts[0].title,
        meta: podcasts[0].podcastName,
        href: podcasts[0].episodeUrl || podcasts[0].audioUrl,
        thumb: podcasts[0].thumbnailUrl,
      }
    : null;

  // Cartes-compteur des formats déjà chargés. Les Éditions n'ont pas de compteur :
  // leur recherche ne se déclenche qu'à l'ouverture de l'onglet dédié (pas de fetch éager).
  const formatCards = [
    { id: "videos", label: "Vidéos", count: videos?.all.length || 0, loading: loadingVideos, teaser: "Analyses, essais & tournage" },
    { id: "podcasts", label: "Podcasts", count: totalPodcasts, loading: loadingPodcasts, teaser: "La critique à écouter" },
    { id: "books", label: "Livres", count: totalBooks, loading: loadingBooks, teaser: "Essais & entretiens" },
    { id: "articles", label: "Articles", count: totalArticles, loading: loadingArticles, teaser: "Presse & revues spécialisées" },
  ].filter((f) => f.count > 0 || f.loading);

  // Cache the available content counts so the homepage can surface films with real depth.
  useUpsertFilmContentStats({
    tmdbId: film?.id,
    videoCount: videos?.all.length || 0,
    podcastCount: totalPodcasts,
    bookCount: totalBooks,
    ready: !!film && !loadingVideos && !loadingPodcasts && !loadingBooks,
  });

  const goToTab = useCallback((tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: document.getElementById("content")?.offsetTop || 0, behavior: "smooth" });
  }, []);

  const similarFilms = similarMoviesData?.results.slice(0, 6).map((movie) => ({
    id: movie.id,
    title: movie.title,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    director: "",
    directorId: 0,
    synopsis: movie.overview,
    genres: [],
    runtime: 0,
    posterUrl: getPosterUrl(movie.poster_path) || "",
    backdropUrl: null,
    rating: movie.vote_average,
    cast: [],
  })) || [];

  if (isLoading) {
    return (
      <div className="dark min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="dark min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Film className="h-12 w-12 text-muted-foreground" />
          <h2 className="font-display text-2xl text-foreground">Film introuvable</h2>
          <Button variant="cinema-outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background">
      {/* SEO — meta tags dynamiques, JSON-LD, canonical */}
      <FilmSEO
        title={film.title}
        year={film.year ?? 0}
        director={film.director ?? ''}
        synopsis={film.synopsis ?? ''}
        posterUrl={film.posterUrl ?? null}
        backdropUrl={film.backdropUrl ?? null}
        filmId={film.id}
        videoCount={videos?.all.length ?? 0}
        podcastCount={totalPodcasts}
        bookCount={totalBooks}
      />

      <Header />

      {/* Hero compact — backdrop + identité du film */}
      <section className="relative pt-14">
        {/* Backdrop ambiance, hauteur réduite */}
        <div className="relative h-[42vh] md:h-[55vh] min-h-[320px] overflow-hidden">
          {film.backdropUrl ? (
            <img
              src={film.backdropUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />

          {/* Retour */}
          <div className="absolute top-6 left-0 right-0 z-20 container mx-auto px-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </div>
        </div>

        {/* Bloc identité — superposé en bas du backdrop, poster + titre */}
        <div className="container mx-auto px-6 -mt-32 md:-mt-40 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
            {/* Poster */}
            {film.posterUrl && (
              <div className="w-36 md:w-52 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/40">
                <img
                  src={film.posterUrl}
                  alt={film.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Identité */}
            <div className="flex-1 min-w-0 pt-2 md:pt-20">
              <h1 className="font-display text-4xl md:text-6xl text-foreground tracking-tight leading-[1] mb-3">
                {film.title}
              </h1>
              {film.originalTitle && film.originalTitle !== film.title && (
                <p className="font-display italic text-lg md:text-xl text-muted-foreground mb-4">
                  {film.originalTitle}
                </p>
              )}

              {/* Métadonnées en ligne */}
              <div className="editorial-label flex flex-wrap items-center gap-x-3 gap-y-2 mb-5 text-foreground/80">
                <span>{film.year}</span>
                {film.runtime > 0 && (
                  <>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {film.runtime} min
                    </span>
                  </>
                )}
                {film.rating > 0 && (
                  <>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1.5">
                      <Star className="h-3 w-3 fill-foreground text-foreground" />
                      {film.rating.toFixed(1)}
                    </span>
                  </>
                )}
                {letterboxdEntry && (
                  <>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3 w-3" />
                      Vu{letterboxdEntry.rating > 0 && ` · ★ ${letterboxdEntry.rating}/5`}
                    </span>
                  </>
                )}
              </div>

              {/* Réalisateur */}
              {film.director && (
                <Link
                  to={`/director/${film.directorId}`}
                  className="inline-flex items-baseline gap-2 mb-5 group"
                >
                  <span className="editorial-label">Réalisé par</span>
                  <span className="font-display text-xl text-foreground group-hover:underline underline-offset-4">
                    {film.director}
                  </span>
                </Link>
              )}

              {/* Genres en pastilles */}
              {film.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {film.genres.map((genre) => (
                    <span
                      key={genre}
                      className="text-xs px-3 py-1 rounded-full border border-border text-foreground/80"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="cinema-outline" size="sm">
                  <Bookmark className="h-4 w-4" />
                  Sauvegarder
                </Button>
                <Button variant="cinema-ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Synopsis + Casting — bandeau dense et organisé */}
      <section className="border-b border-border/60 mt-12 md:mt-16 py-10 md:py-14">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-10 md:gap-12">
            {/* Synopsis : tronqué + expand */}
            {film.synopsis && (
              <div className="md:col-span-7">
                <h3 className="editorial-label mb-4">Synopsis</h3>
                <p
                  className={cn(
                    "font-display text-xl md:text-2xl text-foreground/90 leading-[1.45]",
                    !synopsisExpanded && "line-clamp-4"
                  )}
                >
                  {film.synopsis}
                </p>
                {film.synopsis.length > 240 && (
                  <button
                    onClick={() => setSynopsisExpanded((v) => !v)}
                    className="editorial-label mt-4 text-foreground hover:opacity-70 transition-opacity"
                  >
                    {synopsisExpanded ? "— Réduire" : "— Lire la suite"}
                  </button>
                )}
              </div>
            )}

            {/* Casting : grille compacte avec photos */}
            {film.cast.length > 0 && (
              <div className="md:col-span-5">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="editorial-label">Distribution</h3>
                  <span className="editorial-label tabular-nums text-muted-foreground/60">
                    {film.cast.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {film.cast.slice(0, 6).map((member) => (
                    <div key={member.name} className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/60">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate leading-tight">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">{member.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs : Aperçu + onglets dédiés */}
      <section id="content" className="container mx-auto px-6 py-10 md:py-14">
        <div className="mb-6">
          <p className="editorial-label mb-2">— Explorer</p>
          <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
            Tout autour du film
          </h2>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="sticky top-14 z-30 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 p-0 border-b border-border rounded-none h-auto w-full justify-start gap-0 flex-wrap">
            {[
              { id: "overview", label: "Aperçu" },
              { id: "books", label: "Livres", count: totalBooks },
              { id: "videos", label: "Vidéos", count: videos?.all.length || 0 },
              { id: "podcasts", label: "Podcasts", count: totalPodcasts },
              { id: "editions", label: "Éditions" },
              { id: "articles", label: "Articles", count: totalArticles },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "rounded-none px-5 py-3 text-[13px] font-medium uppercase tracking-[0.15em] border-b border-transparent bg-transparent shadow-none -mb-px",
                  "data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 text-[10px] text-muted-foreground tabular-nums">{tab.count}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* APERÇU → "Pour commencer" (une reco) + parcours par format (cartes-compteur) */}
          <TabsContent value="overview" className="space-y-12 mt-8">
            {lead && (
              <div>
                <p className="editorial-label mb-4">— Pour commencer</p>
                <a
                  href={lead.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid sm:grid-cols-[minmax(0,240px)_1fr] gap-5 rounded-sm border border-border/60 overflow-hidden transition-colors hover:border-foreground/40"
                >
                  <div className="relative aspect-video sm:aspect-auto sm:h-full min-h-[150px] bg-muted overflow-hidden">
                    {lead.thumb && (
                      <img src={lead.thumb} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center">
                        <Play className="h-5 w-5 text-foreground fill-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 flex flex-col justify-center">
                    <span className="editorial-label text-foreground/60">
                      {lead.kicker}{lead.metaShort ? ` · ${lead.metaShort}` : ""}
                    </span>
                    <h3 className="font-display text-xl md:text-2xl text-foreground tracking-tight mt-2 mb-2 line-clamp-2">
                      {lead.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{lead.meta}</p>
                  </div>
                </a>
              </div>
            )}

            <div>
              <p className="editorial-label mb-4">— Parcourir par format</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formatCards.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => goToTab(f.id)}
                    className="group text-left rounded-sm border border-border/60 p-4 transition-colors hover:border-foreground/40 hover:bg-foreground/[0.02]"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-lg text-foreground">{f.label}</span>
                      {f.count > 0 ? (
                        <span className="editorial-label tabular-nums">{f.count}</span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{f.teaser}</p>
                  </button>
                ))}
                {/* Éditions : toujours proposées, compteur chargé à l'ouverture de l'onglet */}
                <button
                  type="button"
                  onClick={() => goToTab("editions")}
                  className="group text-left rounded-sm border border-border/60 p-4 transition-colors hover:border-foreground/40 hover:bg-foreground/[0.02]"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-lg text-foreground">Éditions</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Blu-ray &amp; restaurations</p>
                </button>
              </div>
            </div>

            {!lead && formatCards.length === 0 && (
              <EmptyState
                message="Le tour du film arrive."
                subMessage="Nous rassemblons vidéos, podcasts, livres et articles autour de ce film."
              />
            )}
          </TabsContent>

          {/* LIVRES */}
          <TabsContent value="books" className="mt-8">
            {loadingBooks ? (
              <SectionLoader />
            ) : books && books.length > 0 ? (
              (() => {
                const frBooks = books.filter((b) => b.language === "fr");
                const otherBooks = books.filter((b) => b.language !== "fr");
                return (
                  <div className="space-y-12">
                    {frBooks.length > 0 && (
                      <div>
                        <SectionHeader title="Éditions françaises" count={frBooks.length} />
                        <PaginatedGrid
                          items={frBooks}
                          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                          renderItem={(book) => <BookCard key={book.id} book={book} film={filmCtx} director={filmDirector} />}
                        />
                      </div>
                    )}
                    {otherBooks.length > 0 && (
                      <div>
                        <SectionHeader title="Éditions originales" count={otherBooks.length} />
                        <PaginatedGrid
                          items={otherBooks}
                          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                          renderItem={(book) => <BookCard key={book.id} book={book} film={filmCtx} director={filmDirector} />}
                        />
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <EmptyState message="Aucun livre sélectionné pour ce film." subMessage="Notre sélection exige une pertinence directe avec le film ou son réalisateur." />
            )}
          </TabsContent>

          {/* VIDÉOS — 2 sections éditoriales */}
          <TabsContent value="videos" className="space-y-12 mt-8">
            {loadingVideos ? (
              <SectionLoader />
            ) : videos && videos.all.length > 0 ? (
              <>
                {totalProduction > 0 && (
                  <div>
                    <SectionHeader
                      title="Autour du tournage"
                      count={totalProduction}
                    />
                    <p className="text-sm text-muted-foreground -mt-4 mb-6 max-w-2xl">
                      Making-of, coulisses et entretiens avec celles et ceux qui ont fait le film.
                    </p>
                    <PaginatedGrid
                      items={videos.production}
                      className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                      renderItem={(v) => <YouTubeVideoCard key={v.id} video={v} filmTmdbId={film.id} film={filmCtx} />}
                    />
                  </div>
                )}
                {totalEditorial > 0 && (
                  <div>
                    <SectionHeader
                      title="Regards & analyses"
                      count={totalEditorial}
                    />
                    <p className="text-sm text-muted-foreground -mt-4 mb-6 max-w-2xl">
                      Présentations, masterclass, vidéos-essais et Q&A — pour réfléchir le film à la manière des cinémathèques.
                    </p>
                    <PaginatedGrid
                      items={videos.editorial}
                      className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                      renderItem={(v) => <YouTubeVideoCard key={v.id} video={v} filmTmdbId={film.id} film={filmCtx} />}
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyState message="Aucune vidéo trouvée." />
            )}
          </TabsContent>

          {/* PODCASTS */}
          <TabsContent value="podcasts" className="mt-8">
            {loadingPodcasts ? (
              <SectionLoader />
            ) : podcasts && podcasts.length > 0 ? (
              <PaginatedGrid
                items={podcasts}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                renderItem={(p) => <PodcastCard key={p.id} episode={p} film={filmCtx} />}
              />
            ) : (
              <EmptyState message="Aucun podcast trouvé." />
            )}
          </TabsContent>

          {/* ÉDITIONS */}
          <TabsContent value="editions" className="mt-8">
            <PhysicalMediaSection
              movieId={film.id}
              filmTitle={film.title}
              originalTitle={film.originalTitle}
              filmYear={film.year}
            />
          </TabsContent>

          {/* ARTICLES */}
          <TabsContent value="articles" className="mt-8">
            {loadingArticles ? (
              <SectionLoader />
            ) : articles && articles.length > 0 ? (
              (() => {
                const specialized = articles.filter((a) => a.sourceKind === "specialized");
                const press = articles.filter((a) => a.sourceKind === "press");
                return (
                  <div className="space-y-12">
                    {specialized.length > 0 && (
                      <div>
                        <SectionHeader title="Revues & médias spécialisés" count={specialized.length} />
                        <PaginatedGrid
                          items={specialized}
                          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                          renderItem={(a) => <ArticleCard key={a.id} article={a} film={filmCtx} />}
                        />
                      </div>
                    )}
                    {press.length > 0 && (
                      <div>
                        <SectionHeader title="Presse généraliste" count={press.length} />
                        <PaginatedGrid
                          items={press}
                          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                          renderItem={(a) => <ArticleCard key={a.id} article={a} film={filmCtx} />}
                        />
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <EmptyState message="Aucun article trouvé pour ce film." />
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar Films */}
      {similarFilms.length > 0 && (
        <section className="border-t border-border/40 py-16">
          <div className="container mx-auto px-6">
            <SectionHeader title="Films similaires" />
            {loadingSimilar ? (
              <SectionLoader />
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6">
                {similarFilms.map((f) => (
                  <FilmCard key={f.id} film={f} size="md" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
