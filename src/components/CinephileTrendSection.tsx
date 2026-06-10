import { Link } from "react-router-dom";
import { Film as FilmIcon } from "lucide-react";
import type { CinephileTrend } from "@/hooks/useCinephileTrend";

interface Props {
  trend: CinephileTrend;
}

export function CinephileTrendSection({ trend }: Props) {
  const cols =
    trend.suggestions.length >= 4
      ? "grid-cols-2 md:grid-cols-4"
      : "grid-cols-2 md:grid-cols-3";

  const exploreHref =
    trend.dimension === "director" && trend.suggestions[0]
      ? `/film/${trend.suggestions[0].id}`
      : null;

  return (
    <section className="border-t border-border py-14 md:py-20 px-6">
      <div className="container mx-auto">
        <div className="mb-8 md:mb-10">
          <div className="editorial-label mb-3 text-foreground/50">
            — Tendances de ta cinéphilie
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
            {trend.editorialTitle}
          </h2>
          <p className="text-sm text-foreground/50 mt-2 font-light tabular-nums">
            {trend.contextLine}
          </p>
        </div>

        <div className={`grid ${cols} gap-4 md:gap-6`}>
          {trend.suggestions.map((film) => (
            <Link key={film.id} to={`/film/${film.id}`} className="group block">
              <div className="relative overflow-hidden rounded-sm aspect-[2/3] bg-muted">
                {film.posterUrl ? (
                  <img
                    src={film.posterUrl}
                    alt={film.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FilmIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-medium text-foreground leading-snug">
                  {film.title}
                </h3>
                <p className="text-xs text-foreground/50 tabular-nums mt-0.5">
                  {film.year > 0 ? film.year : "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {exploreHref && (
          <div className="mt-8">
            <Link
              to={exploreHref}
              className="editorial-label text-foreground/60 hover:text-foreground transition-colors"
            >
              Explorer →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}