import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, Play, ArrowRight, Loader2, Star, Eye, ThumbsUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchFilmVideos } from "@/services/youtube";
import { YouTubeVideo } from "@/services/youtube";
import { getPosterUrl } from "@/services/tmdb";
import { cn } from "@/lib/utils";
import { useVideoFeedback } from "@/hooks/useVideoFeedback";

interface DiaryFilm {
  id: number;
  title: string;
  year: number;
  posterUrl: string | null;
  _userRating?: number;
  _watchedDate?: string;
  director?: string;
}

interface FilmWithContent {
  film: DiaryFilm;
  topVideo: YouTubeVideo | null;
}

function formatViewCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

export function DiaryContentHighlights({ films }: { films: DiaryFilm[] }) {
  const [expanded, setExpanded] = useState(false);
  const { downIds } = useVideoFeedback();

  // Fetch top video for each film (max 4 initially)
  const { data: filmsWithContent, isLoading } = useQuery({
    queryKey: ["diary-content-highlights", films.map(f => f.id)],
    queryFn: async (): Promise<FilmWithContent[]> => {
      const results: FilmWithContent[] = [];
      // Fetch for top 6 films in parallel
      const toFetch = films.slice(0, 6);
      const videoPromises = toFetch.map(async (film) => {
        try {
          const videos = await searchFilmVideos(film.title, film.year, film.director);
          const filtered = videos.filter((v) => !downIds.has(v.id));
          return { film, topVideo: filtered[0] || null };
        } catch {
          return { film, topVideo: null };
        }
      });
      const settled = await Promise.all(videoPromises);
      return settled.filter(r => r.topVideo !== null);
    },
    enabled: films.length > 0,
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading) {
    return (
      <section className="relative py-5 md:py-12 px-4 md:px-6">
        <div className="container mx-auto">
          <SectionHeader />
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (!filmsWithContent || filmsWithContent.length === 0) return null;

  const visibleItems = expanded ? filmsWithContent : filmsWithContent.slice(0, 3);
  const hasMore = filmsWithContent.length > 3;

  return (
    <section className="relative py-5 md:py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <SectionHeader
          hasMore={hasMore && !expanded}
          onExpand={() => setExpanded(true)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {visibleItems.map(({ film, topVideo }) => (
            <ContentHighlightCard key={film.id} film={film} video={topVideo!} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ hasMore, onExpand }: { hasMore?: boolean; onExpand?: () => void }) {
  return (
    <div className="flex items-end justify-between mb-5 md:mb-8">
      <div className="flex items-start gap-2.5 md:gap-3">
        <div className="mt-0.5">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl md:text-3xl font-bold text-foreground mb-0.5">
            À explorer
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm">
            Le meilleur contenu sur vos films récents
          </p>
        </div>
      </div>
      {hasMore && onExpand && (
        <Button variant="cinema-ghost" size="sm" onClick={onExpand} className="gap-1.5 shrink-0 text-xs md:text-sm">
          Voir plus <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Button>
      )}
    </div>
  );
}

function ContentHighlightCard({ film, video }: { film: DiaryFilm; video: YouTubeVideo }) {
  return (
    <div className="content-card overflow-hidden group">
      {/* Video thumbnail */}
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video overflow-hidden"
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
          {video.duration}
        </div>
      </a>

      {/* Content info */}
      <div className="p-3 md:p-4">
        {/* Film context row */}
        <Link to={`/film/${film.id}`} className="flex items-center gap-2.5 mb-2.5 group/film">
          {film.posterUrl && (
            <img
              src={film.posterUrl}
              alt={film.title}
              className="w-8 h-12 rounded object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-xs text-primary font-medium uppercase tracking-wider">Deep Dive</p>
            <p className="text-sm font-medium text-foreground truncate group-hover/film:text-primary transition-colors">
              {film.title}
              {film.year > 0 && <span className="text-muted-foreground font-normal"> ({film.year})</span>}
            </p>
            {(film as any)._userRating > 0 && (
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-2.5 w-2.5",
                      i < Math.round((film as any)._userRating)
                        ? "text-primary fill-primary"
                        : "text-muted-foreground/40"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Video title */}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h4 className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
            {video.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 truncate">{video.channelTitle}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViewCount(video.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {formatViewCount(video.likeCount)}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
