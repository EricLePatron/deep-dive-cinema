import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Film } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface FilmCardProps {
  film: Film;
  size?: "sm" | "md" | "lg";
}

export function FilmCard({ film, size = "md" }: FilmCardProps) {
  const sizeClasses = {
    sm: "w-32",
    md: "w-44",
    lg: "w-56",
  };

  const posterHeight = {
    sm: "h-48",
    md: "h-64",
    lg: "h-80",
  };

  return (
    <Link
      to={`/film/${film.id}`}
      className={cn(
        "group flex-shrink-0 block",
        sizeClasses[size]
      )}
    >
      <div className="relative overflow-hidden rounded-lg poster-shadow">
        <div className={cn("relative overflow-hidden", posterHeight[size])}>
          <img
            src={film.posterUrl}
            alt={film.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick info on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-3 text-white/90 text-xs">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-primary fill-primary" />
                {film.rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {film.runtime}m
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {film.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {film.year} • {film.director}
        </p>
      </div>
    </Link>
  );
}
