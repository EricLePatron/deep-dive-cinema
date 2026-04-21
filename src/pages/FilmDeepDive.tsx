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
import { ContentCard } from "@/components/ContentCard";
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
import { cn } from "@/lib/utils";
import { PhysicalMediaSection } from "@/components/PhysicalMediaSection";

const PREVIEW = 3;

interface SectionHeaderProps {
  title: string;
  count?: number;
  onViewAll?: () => void;
}

function SectionHeader({ title, count, onViewAll }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-border/40">
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-xl font-medium text-foreground tracking-tight">
          {title}
        </h2>
        {count !== undefined && count > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
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

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground/70 py-6">{message}</p>;
}

export default function FilmDeepDive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const movieId = id ? parseInt(id, 10) : undefined;
  const { data: film, isLoading, error } = useMovieDetails(movieId);
  const { data: similarMoviesData, isLoading: loadingSimilar } = useSimilarMovies(movieId);

  const filmTitle = film?.title || "";
  const filmYear = film?.year;
  const filmDirector = film?.director || "";

  const { data: videos, isLoading: loadingVideos } = useFilmVideos(filmTitle, filmYear, filmDirector, film?.originalTitle);
  const { data: podcasts, isLoading: loadingPodcasts } = useFilmPodcasts(filmTitle, filmDirector);

  const castNames = film?.cast?.map((c) => c.name) || [];
  const { data: books, isLoading: loadingBooks } = useFilmBooks(
    filmTitle, film?.originalTitle, filmDirector, castNames, film?.genres
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
          <h2 className="font-display text-xl font-semibold text-foreground">Film introuvable</h2>
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
      <Header />

      {/* Hero immersif minimaliste */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        {film.backdropUrl ? (
          <img
            src={film.backdropUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        {/* Gradient overlays — monochrome, dramatic */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />

        {/* Top nav */}
        <div className="absolute top-20 left-0 right-0 z-20 container mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>

        {/* Hero content — centered minimal */}
        <div className="relative z-10 container mx-auto px-6 pb-20">
          <div className="max-w-3xl">
            {/* Year + runtime + rating */}
            <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">
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
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground tracking-tight leading-[1.05] mb-6">
              {film.title}
            </h1>

            {/* Director */}
            {film.director && (
              <Link
                to={`/director/${film.directorId}`}
                className="inline-flex items-center gap-2 text-base text-foreground/80 hover:text-foreground transition-colors mb-8"
              >
                <span className="text-muted-foreground">Un film de</span>
                <span className="font-medium underline-offset-4 hover:underline">{film.director}</span>
              </Link>
            )}

            {/* Letterboxd badge */}
            {letterboxdEntry && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/10 border border-foreground/15 mb-8">
                <Eye className="h-3.5 w-3.5 text-foreground" />
                <span className="text-xs text-foreground/80">
                  Vu sur Letterboxd
                  {letterboxdEntry.rating > 0 && ` · ${letterboxdEntry.rating}/5`}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="cinema" size="default">
                <Bookmark className="h-4 w-4" />
                Sauvegarder
              </Button>
              <Button variant="cinema-outline" size="default">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Synopsis + meta band */}
      <section className="border-b border-border/40 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl">
            {/* Synopsis */}
            <div className="md:col-span-2">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">
                Synopsis
              </h3>
              <p className="text-base md:text-lg text-foreground/85 leading-relaxed">
                {film.synopsis}
              </p>
              {film.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {film.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-muted/40 text-muted-foreground border border-border/40"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cast */}
            {film.cast.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">
                  Distribution
                </h3>
                <div className="space-y-3">
                  {film.cast.slice(0, 5).map((member) => (
                    <div key={member.name} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.character}</p>
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
      <section id="content" className="container mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="bg-transparent p-0 border-b border-border/40 rounded-none h-auto w-full justify-start gap-1 flex-wrap">
            {[
              { id: "overview", label: "Aperçu" },
              { id: "books", label: "Livres", count: totalBooks },
              { id: "videos", label: "Vidéos", count: videos?.all.length || 0 },
              { id: "podcasts", label: "Podcasts", count: totalPodcasts },
              { id: "editions", label: "Éditions" },
              { id: "articles", label: "Articles", count: mockArticles.length },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "rounded-none px-4 py-3 text-sm font-medium border-b-2 border-transparent bg-transparent shadow-none",
                  "data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground tabular-nums">{tab.count}</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* APERÇU — 3 highlights par section */}
          <TabsContent value="overview" className="space-y-14 mt-8">
            {/* Livres */}
            <div>
              <SectionHeader
                title="Livres & essais"
                count={totalBooks}
                onViewAll={totalBooks > PREVIEW ? () => goToTab("books") : undefined}
              />
              {loadingBooks ? (
                <SectionLoader />
              ) : books && books.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.slice(0, PREVIEW).map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Aucun livre trouvé." />
              )}
            </div>

            {/* Autour du tournage : making-of, coulisses, interviews équipe */}
            {(loadingVideos || totalProduction > 0) && (
              <div>
                <SectionHeader
                  title="Autour du tournage"
                  count={totalProduction}
                  onViewAll={totalProduction > PREVIEW ? () => goToTab("videos") : undefined}
                />
                {loadingVideos ? (
                  <SectionLoader />
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos!.production.slice(0, PREVIEW).map((video) => (
                      <YouTubeVideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Regards & analyses : présentations, masterclass, vidéos-essais */}
            {(loadingVideos || totalEditorial > 0) && (
              <div>
                <SectionHeader
                  title="Regards & analyses"
                  count={totalEditorial}
                  onViewAll={totalEditorial > PREVIEW ? () => goToTab("videos") : undefined}
                />
                {loadingVideos ? (
                  <SectionLoader />
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos!.editorial.slice(0, PREVIEW).map((video) => (
                      <YouTubeVideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Podcasts */}
            {(loadingPodcasts || totalPodcasts > 0) && (
              <div>
                <SectionHeader
                  title="Podcasts"
                  count={totalPodcasts}
                  onViewAll={totalPodcasts > PREVIEW ? () => goToTab("podcasts") : undefined}
                />
                {loadingPodcasts ? (
                  <SectionLoader />
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {podcasts!.slice(0, PREVIEW).map((p) => (
                      <PodcastCard key={p.id} episode={p} variant="compact" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aperçu éditions */}
            <div>
              <SectionHeader
                title="Éditions physiques"
                onViewAll={() => goToTab("editions")}
              />
              <PhysicalMediaSection
                movieId={film.id}
                filmTitle={film.title}
                originalTitle={film.originalTitle}
                filmYear={film.year}
              />
            </div>
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
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {frBooks.map((book) => <BookCard key={book.id} book={book} />)}
                        </div>
                      </div>
                    )}
                    {otherBooks.length > 0 && (
                      <div>
                        <SectionHeader title="Autres éditions" count={otherBooks.length} />
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {otherBooks.map((book) => <BookCard key={book.id} book={book} />)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <EmptyState message="Aucun livre trouvé pour ce film." />
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.production.map((v) => <YouTubeVideoCard key={v.id} video={v} />)}
                    </div>
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.editorial.map((v) => <YouTubeVideoCard key={v.id} video={v} />)}
                    </div>
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {podcasts.map((p) => <PodcastCard key={p.id} episode={p} />)}
              </div>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockArticles.map((article) => (
                <ContentCard key={article.id} item={article} />
              ))}
            </div>
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
