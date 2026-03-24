import { useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  User,
  Book,
  Video,
  Play,
  Headphones,
  FileText,
  Mic,
  Bookmark,
  Share2,
  ChevronRight,
  Loader2,
  Film,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { ContentCard } from "@/components/ContentCard";
import { ContentSection } from "@/components/ContentSection";
import { FilmCard } from "@/components/FilmCard";
import { YouTubeVideoCard } from "@/components/YouTubeVideoCard";
import { PodcastCard } from "@/components/PodcastCard";
import { useMovieDetails, useSimilarMovies } from "@/hooks/useTMDB";
import { useFilmVideos } from "@/hooks/useYouTube";
import { useFilmPodcasts } from "@/hooks/usePodcast";
import { useLetterboxdProfile, useLetterboxdFeed } from "@/hooks/useLetterboxd";
import { getPosterUrl } from "@/services/tmdb";
import {
  mockBooks,
  mockArticles,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { PhysicalMediaSection } from "@/components/PhysicalMediaSection";

const tabs = [
  { id: "all", label: "All Content", icon: null },
  { id: "books", label: "Books", icon: Book },
  { id: "docs", label: "Behind the Scenes", icon: Video },
  { id: "youtube", label: "Video Essays", icon: Play },
  { id: "podcasts", label: "Podcasts", icon: Headphones },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "interviews", label: "Interviews", icon: Mic },
];

export default function FilmDeepDive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const PREVIEW_COUNT = 3;
  const movieId = id ? parseInt(id, 10) : undefined;
  const { data: film, isLoading, error } = useMovieDetails(movieId);
  const { data: similarMoviesData, isLoading: loadingSimilar } = useSimilarMovies(movieId);

  // Fetch YouTube videos based on film title + director for accuracy
  const filmTitle = film?.title || "";
  const filmYear = film?.year;
  const filmDirector = film?.director || "";

  const { data: videos, isLoading: loadingVideos } = useFilmVideos(filmTitle, filmYear, filmDirector);
  
  // Fetch podcasts based on film title + director
  const { data: podcasts, isLoading: loadingPodcasts } = useFilmPodcasts(filmTitle, filmDirector);

  // Letterboxd status
  const { profile } = useLetterboxdProfile();
  const { data: letterboxdFilms } = useLetterboxdFeed(profile?.username);
  const letterboxdEntry = letterboxdFilms?.find(
    (f) => f.filmTitle.toLowerCase() === filmTitle.toLowerCase()
  );
  const totalVideos = videos?.all.length || 0;
  const totalPodcasts = podcasts?.length || 0;
  const totalContent =
    mockBooks.length +
    totalVideos +
    totalPodcasts +
    mockArticles.length;

  // Transform similar movies to FilmCard format
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
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="dark min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Film className="h-16 w-16 text-muted-foreground" />
          <h2 className="font-display text-2xl font-bold text-foreground">Film not found</h2>
          <p className="text-muted-foreground">We couldn't find this film. Please try another search.</p>
          <Button variant="cinema" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background">
      <Header />

      {/* Hero with backdrop */}
      <section className="relative pt-16">
        {/* Backdrop image */}
        <div className="absolute inset-0 h-[70vh] overflow-hidden">
          {film.backdropUrl ? (
            <img
              src={film.backdropUrl}
              alt=""
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/60" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-10">
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to search</span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-64 poster-shadow rounded-xl overflow-hidden cinema-glow">
                {film.posterUrl ? (
                  <img
                    src={film.posterUrl}
                    alt={film.title}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                    <Film className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Film Info */}
            <div className="flex-1 stagger-children">
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {film.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
                {film.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {film.year}
                </span>
                {film.runtime > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {film.runtime} min
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  {film.rating.toFixed(1)}
                </span>
                {film.director && (
                  <Link
                    to={`/director/${film.directorId}`}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <User className="h-4 w-4" />
                    {film.director}
                  </Link>
                )}
              </div>

              {/* Synopsis */}
              <p className="text-lg text-foreground/80 leading-relaxed max-w-2xl mb-8">
                {film.synopsis}
              </p>

              {/* Letterboxd Status */}
              {letterboxdEntry && (
                <div className="flex items-center gap-3 mb-8 px-4 py-3 rounded-xl bg-accent/50 border border-accent w-fit">
                  <Eye className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Vu sur Letterboxd
                      {letterboxdEntry.watchedDate && (
                        <span className="text-muted-foreground font-normal"> — {new Date(letterboxdEntry.watchedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      )}
                    </p>
                    {letterboxdEntry.rating > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < Math.round(letterboxdEntry.rating) ? "text-primary fill-primary" : "text-muted-foreground"
                            )}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{letterboxdEntry.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cast */}
              {film.cast.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    PRINCIPAL CAST
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {film.cast.slice(0, 4).map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center gap-3 bg-muted/30 rounded-full pr-4"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.character}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button variant="cinema" size="lg" className="group">
                  <Bookmark className="h-4 w-4" />
                  Save Film
                </Button>
                <Button variant="cinema-outline" size="lg">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Content Stats */}
          <div className="mt-16 p-6 rounded-2xl glass-panel">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                  {loadingVideos ? "Loading content..." : `${totalContent} pieces of content found`}
                </h2>
                <p className="text-muted-foreground">
                  Deep dive into everything about {film.title}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {[
                  { icon: Book, count: mockBooks.length, label: "Books" },
                  { icon: Play, count: totalVideos, label: "Videos", loading: loadingVideos },
                  { icon: Headphones, count: totalPodcasts, label: "Podcasts", loading: loadingPodcasts },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30"
                  >
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {stat.loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        stat.count
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="container mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-muted/30 p-1.5 rounded-xl h-auto flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                )}
              >
                {tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Content Tab */}
          <TabsContent value="all" className="space-y-2">
            {/* Books */}
            <ContentSection
              title="Books & Essays"
              icon={<Book className="h-5 w-5" />}
              count={mockBooks.length}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockBooks.map((book) => (
                  <ContentCard key={book.id} item={book} />
                ))}
              </div>
            </ContentSection>

            {/* Behind the Scenes / Making of */}
            <ContentSection
              title="Behind the Scenes & Making-of"
              icon={<Video className="h-5 w-5" />}
              count={videos?.behindTheScenes.length || 0}
            >
            {loadingVideos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : videos?.behindTheScenes && videos.behindTheScenes.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(expandedSections['bts'] ? videos.behindTheScenes : videos.behindTheScenes.slice(0, PREVIEW_COUNT)).map((video) => (
                      <YouTubeVideoCard key={video.id} video={video} />
                    ))}
                  </div>
                  {videos.behindTheScenes.length > PREVIEW_COUNT && (
                    <div className="flex justify-center mt-4">
                      <Button variant="cinema-ghost" onClick={() => toggleSection('bts')} className="group">
                        {expandedSections['bts'] ? 'Voir moins' : `Voir plus (${videos.behindTheScenes.length - PREVIEW_COUNT} de plus)`}
                        <ChevronRight className={cn("h-4 w-4 transition-transform ml-1", expandedSections['bts'] && "rotate-90")} />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground py-4">No behind-the-scenes content found. Check the "All Videos" section below.</p>
              )}
            </ContentSection>

            {/* Video Essays / Analysis */}
            <ContentSection
              title="Video Essays & Analyses"
              icon={<Play className="h-5 w-5" />}
              count={videos?.analysis.length || 0}
            >
            {loadingVideos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : videos?.analysis && videos.analysis.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(expandedSections['analysis'] ? videos.analysis : videos.analysis.slice(0, PREVIEW_COUNT)).map((video) => (
                      <YouTubeVideoCard key={video.id} video={video} />
                    ))}
                  </div>
                  {videos.analysis.length > PREVIEW_COUNT && (
                    <div className="flex justify-center mt-4">
                      <Button variant="cinema-ghost" onClick={() => toggleSection('analysis')} className="group">
                        {expandedSections['analysis'] ? 'Voir moins' : `Voir plus (${videos.analysis.length - PREVIEW_COUNT} de plus)`}
                        <ChevronRight className={cn("h-4 w-4 transition-transform ml-1", expandedSections['analysis'] && "rotate-90")} />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground py-4">No video essays found. Check the "All Videos" section below.</p>
              )}
            </ContentSection>

            {/* Podcasts */}
            <ContentSection
              title="Podcasts"
              icon={<Headphones className="h-5 w-5" />}
              count={totalPodcasts}
            >
              {loadingPodcasts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : podcasts && podcasts.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(expandedSections['podcasts'] ? podcasts : podcasts.slice(0, PREVIEW_COUNT)).map((podcast) => (
                      <PodcastCard key={podcast.id} episode={podcast} variant="compact" />
                    ))}
                  </div>
                  {podcasts.length > PREVIEW_COUNT && (
                    <div className="flex justify-center mt-4">
                      <Button variant="cinema-ghost" onClick={() => toggleSection('podcasts')} className="group">
                        {expandedSections['podcasts'] ? 'Voir moins' : `Voir plus (${podcasts.length - PREVIEW_COUNT} de plus)`}
                        <ChevronRight className={cn("h-4 w-4 transition-transform ml-1", expandedSections['podcasts'] && "rotate-90")} />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground py-4">Aucun podcast trouvé pour ce film.</p>
              )}
            </ContentSection>

            {/* Articles */}
            <ContentSection
              title="Articles & Critiques"
              icon={<FileText className="h-5 w-5" />}
              count={mockArticles.length}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockArticles.map((article) => (
                  <ContentCard key={article.id} item={article} variant="compact" />
                ))}
              </div>
            </ContentSection>

            {/* Interviews */}
            <ContentSection
              title="Interviews & Q&A"
              icon={<Mic className="h-5 w-5" />}
              count={videos?.interviews.length || 0}
            >
            {loadingVideos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : videos?.interviews && videos.interviews.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(expandedSections['interviews'] ? videos.interviews : videos.interviews.slice(0, PREVIEW_COUNT)).map((video) => (
                      <YouTubeVideoCard key={video.id} video={video} variant="compact" />
                    ))}
                  </div>
                  {videos.interviews.length > PREVIEW_COUNT && (
                    <div className="flex justify-center mt-4">
                      <Button variant="cinema-ghost" onClick={() => toggleSection('interviews')} className="group">
                        {expandedSections['interviews'] ? 'Voir moins' : `Voir plus (${videos.interviews.length - PREVIEW_COUNT} de plus)`}
                        <ChevronRight className={cn("h-4 w-4 transition-transform ml-1", expandedSections['interviews'] && "rotate-90")} />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground py-4">No interviews found. Check the "All Videos" section below.</p>
              )}
            </ContentSection>

            {/* All Videos (uncategorized or reviews) */}
            {videos && (videos.other.length > 0 || videos.reviews.length > 0) && (
              <ContentSection
                title="More Videos"
                icon={<Play className="h-5 w-5" />}
                count={(videos.other.length || 0) + (videos.reviews.length || 0)}
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...videos.reviews, ...videos.other].map((video) => (
                    <YouTubeVideoCard key={video.id} video={video} />
                  ))}
                </div>
              </ContentSection>
            )}
          </TabsContent>

          {/* Individual content tabs */}
          <TabsContent value="books">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockBooks.map((book) => (
                <ContentCard key={book.id} item={book} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="docs">
            {loadingVideos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : videos?.behindTheScenes && videos.behindTheScenes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.behindTheScenes.map((video) => (
                  <YouTubeVideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No behind-the-scenes content found for this film.</p>
                {videos?.all && videos.all.length > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground mb-6">Here are all available videos:</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.all.slice(0, 6).map((video) => (
                        <YouTubeVideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="youtube">
            {loadingVideos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : videos?.all && videos.all.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.all.map((video) => (
                  <YouTubeVideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center">No videos found for this film.</p>
            )}
          </TabsContent>

          <TabsContent value="podcasts">
            {loadingPodcasts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : podcasts && podcasts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {podcasts.map((podcast) => (
                  <PodcastCard key={podcast.id} episode={podcast} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center">Aucun podcast trouvé pour ce film.</p>
            )}
          </TabsContent>

          <TabsContent value="articles">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockArticles.map((article) => (
                <ContentCard key={article.id} item={article} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interviews">
            {loadingVideos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : videos?.interviews && videos.interviews.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.interviews.map((video) => (
                  <YouTubeVideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No interviews found for this film.</p>
                {videos?.all && videos.all.length > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground mb-6">Here are all available videos:</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.all.slice(0, 6).map((video) => (
                        <YouTubeVideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar Films */}
      <section className="border-t border-border/50 py-16 px-6">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Similar Films to Explore
              </h2>
              <p className="text-muted-foreground">
                Continue your cinematic journey
              </p>
            </div>
            <Button variant="cinema-ghost" className="group">
              View all
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {loadingSimilar ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : similarFilms.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6">
              {similarFilms.map((f) => (
                <FilmCard key={f.id} film={f} size="md" />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No similar films found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
