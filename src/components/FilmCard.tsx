import { Link } from "react-router-dom";
import { Star, Film as FilmIcon } from "lucide-react";
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
}

export function FilmCard({ film, size = "md" }: FilmCardProps) {
  const sizeClasses = {
    sm: "w-32",
    md: "w-40",
    lg: "w-48",
  };

  return (
    <Link
      to={`/film/${film.id}`}
      className={cn(
        "group flex-shrink-0 block",
        sizeClasses[size]
      )}
    >
      <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-muted transition-transform duration-300 group-hover:scale-105 poster-shadow">
        {film.posterUrl ? (
          <img
            src={film.posterUrl}
            alt={film.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FilmIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {film.rating !== undefined && film.rating > 0 && (
            <div className="flex items-center gap-1 text-primary">
              <Star className="h-3.5 w-3.5 fill-primary" />
              <span className="text-sm font-medium">{film.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {film.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {film.year > 0 ? film.year : "Unknown year"}
          {film.director && ` • ${film.director}`}
        </p>
      </div>
    </Link>
  );
}
