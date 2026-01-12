import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { ContentCard } from "@/components/ContentCard";
import { ContentSection } from "@/components/ContentSection";
import {
  mockFilm,
  mockBooks,
  mockDocumentaries,
  mockYouTubeVideos,
  mockPodcasts,
  mockArticles,
  mockInterviews,
  popularFilms,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { FilmCard } from "@/components/FilmCard";

const tabs = [
  { id: "all", label: "All Content", icon: null },
  { id: "books", label: "Books", icon: Book },
  { id: "docs", label: "Documentaries", icon: Video },
  { id: "youtube", label: "Video Essays", icon: Play },
  { id: "podcasts", label: "Podcasts", icon: Headphones },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "interviews", label: "Interviews", icon: Mic },
];

export default function FilmDeepDive() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("all");

  // In real app, fetch film by ID from TMDB
  const film = mockFilm;

  const totalContent =
    mockBooks.length +
    mockDocumentaries.length +
    mockYouTubeVideos.length +
    mockPodcasts.length +
    mockArticles.length +
    mockInterviews.length;

  return (
    <div className="dark min-h-screen bg-background">
      <Header />

      {/* Hero with backdrop */}
      <section className="relative pt-16">
        {/* Backdrop image */}
        <div className="absolute inset-0 h-[70vh] overflow-hidden">
          <img
            src={film.backdropUrl}
            alt=""
            className="w-full h-full object-cover object-top"
          />
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
                <img
                  src={film.posterUrl}
                  alt={film.title}
                  className="w-full h-auto"
                />
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
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {film.runtime} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  {film.rating.toFixed(1)}
                </span>
                <Link
                  to={`/director/${film.directorId}`}
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <User className="h-4 w-4" />
                  {film.director}
                </Link>
              </div>

              {/* Synopsis */}
              <p className="text-lg text-foreground/80 leading-relaxed max-w-2xl mb-8">
                {film.synopsis}
              </p>

              {/* Cast */}
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
                  {totalContent} pieces of content found
                </h2>
                <p className="text-muted-foreground">
                  Deep dive into everything about {film.title}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {[
                  { icon: Book, count: mockBooks.length, label: "Books" },
                  { icon: Play, count: mockYouTubeVideos.length, label: "Videos" },
                  { icon: Headphones, count: mockPodcasts.length, label: "Podcasts" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30"
                  >
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{stat.count}</span>
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

            {/* Documentaries */}
            <ContentSection
              title="Documentaries & Making-of"
              icon={<Video className="h-5 w-5" />}
              count={mockDocumentaries.length}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {mockDocumentaries.map((doc) => (
                  <ContentCard key={doc.id} item={doc} />
                ))}
              </div>
            </ContentSection>

            {/* YouTube Videos */}
            <ContentSection
              title="Video Essays & Analyses"
              icon={<Play className="h-5 w-5" />}
              count={mockYouTubeVideos.length}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {mockYouTubeVideos.map((video) => (
                  <ContentCard key={video.id} item={video} />
                ))}
              </div>
            </ContentSection>

            {/* Podcasts */}
            <ContentSection
              title="Podcasts"
              icon={<Headphones className="h-5 w-5" />}
              count={mockPodcasts.length}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockPodcasts.map((podcast) => (
                  <ContentCard key={podcast.id} item={podcast} variant="compact" />
                ))}
              </div>
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
              title="Interviews"
              icon={<Mic className="h-5 w-5" />}
              count={mockInterviews.length}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockInterviews.map((interview) => (
                  <ContentCard key={interview.id} item={interview} variant="compact" />
                ))}
              </div>
            </ContentSection>
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
            <div className="grid md:grid-cols-2 gap-4">
              {mockDocumentaries.map((doc) => (
                <ContentCard key={doc.id} item={doc} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="youtube">
            <div className="grid md:grid-cols-2 gap-4">
              {mockYouTubeVideos.map((video) => (
                <ContentCard key={video.id} item={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="podcasts">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPodcasts.map((podcast) => (
                <ContentCard key={podcast.id} item={podcast} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="articles">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockArticles.map((article) => (
                <ContentCard key={article.id} item={article} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interviews">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockInterviews.map((interview) => (
                <ContentCard key={interview.id} item={interview} />
              ))}
            </div>
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

          <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6">
            {popularFilms.map((f) => (
              <FilmCard key={f.id} film={f} size="md" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
