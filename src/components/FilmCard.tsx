import { Link } from "react-router-dom";
import { Film as FilmIcon, Video, Mic, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilmCardProps {
  film: {
    id: number;
    title: string;
    year: number;
    director?: string;
    posterUrl: string | null;
    rating?: number;
  };
  size?: "sm" | "md" | "lg";
  stats?: { video_count: number; podcast_count: number; book_count: number } | null;
}

export function FilmCard({ film, size = "md", stats }: FilmCardProps) {
  const sizeClasses = {
    sm: "w-24 md:w-28",
    md: "w-28 md:w-36 snap-start",
    lg: "w-36 md:w-44",
  };

  return (
    <Link
      to={`/film/${film.id}`}
      className={cn("group flex-shrink-0 block", sizeClasses[size])}
    >
      <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-muted transition-opacity duration-200 group-hover:opacity-85">
        {film.posterUrl ? (
          <img
            src={film.posterUrl}
            alt={film.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FilmIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="mt-2.5">
        <h3 className="text-[13px] font-medium text-foreground truncate leading-snug">
          {film.title}
        </h3>
        <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
          {film.year > 0 ? film.year : "—"}
        </p>
        {stats && (
          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground tabular-nums">
            <span className="flex items-center gap-0.5"><Video className="h-2.5 w-2.5" />{stats.video_count}</span>
            <span className="flex items-center gap-0.5"><Mic className="h-2.5 w-2.5" />{stats.podcast_count}</span>
            <span className="flex items-center gap-0.5"><BookOpen className="h-2.5 w-2.5" />{stats.book_count}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
