import { ExternalLink, Store, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { ContentSection } from "@/components/ContentSection";
import { usePhysicalMedia } from "@/hooks/usePhysicalMedia";
import { useFrenchEditions, type FrenchEdition } from "@/hooks/useFrenchEditions";
import { getCountryName } from "@/services/tmdbReleases";
import { cn } from "@/lib/utils";

interface PhysicalMediaSectionProps {
  movieId: number;
  filmTitle: string;
  originalTitle?: string;
  filmYear: number;
}

const TOP_COUNT = 3;

function formatDateFr(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function EditionCard({ edition, featured = false }: { edition: FrenchEdition; featured?: boolean }) {
  return (
    <a
      href={edition.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex gap-4 rounded-sm border border-border/60 transition-colors hover:border-foreground/40 hover:bg-foreground/[0.02] overflow-hidden",
        featured ? "p-4" : "p-3"
      )}
    >
      {edition.image ? (
        <img
          src={edition.image}
          alt={edition.title}
          loading="lazy"
          className={cn(
            "object-cover rounded-sm flex-shrink-0 bg-muted",
            featured ? "w-24 h-32" : "w-16 h-20"
          )}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = "none";
            img.parentElement?.querySelector("[data-fallback]")?.removeAttribute("hidden");
          }}
        />
      ) : null}
      {!edition.image && (
        <div
          data-fallback
          className={cn(
            "flex items-center justify-center rounded-sm flex-shrink-0 border border-border/60 bg-foreground/[0.02]",
            featured ? "w-24 h-32" : "w-16 h-20"
          )}
        >
          <Store className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <span className="editorial-label">{edition.format}</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p
            className={cn(
              "font-medium text-foreground leading-tight mt-2 line-clamp-2",
              featured ? "text-sm" : "text-xs"
            )}
          >
            {edition.title}
          </p>
          {featured && edition.description && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
              {edition.description}
            </p>
          )}
        </div>
        <p className="editorial-label mt-2">{edition.retailer}</p>
      </div>
    </a>
  );
}

export function PhysicalMediaSection({ movieId, filmTitle, originalTitle, filmYear }: PhysicalMediaSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const {
    upcomingReleases,
    frPhysicalDate,
    frDigitalDate,
    isLoading: isLoadingTMDB,
  } = usePhysicalMedia(movieId, filmTitle, filmYear);

  const {
    data: frenchEditions,
    isLoading: isLoadingEditions,
  } = useFrenchEditions(filmTitle, filmYear, true, originalTitle);

  const isLoading = isLoadingTMDB || isLoadingEditions;

  if (isLoading) {
    return (
      <ContentSection title="Éditions françaises" count={0}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      </ContentSection>
    );
  }

  const upcomingFR = upcomingReleases.filter((r) => r.country === "FR");
  const upcomingOther = upcomingReleases.filter((r) => r.country !== "FR").slice(0, 3);
  const hasUpcoming = upcomingReleases.length > 0;
  const hasEditions = frenchEditions && frenchEditions.length > 0;

  const sortedEditions = frenchEditions || [];
  const topEditions = sortedEditions.slice(0, TOP_COUNT);
  const restEditions = sortedEditions.slice(TOP_COUNT);

  const totalCount = (frenchEditions?.length || 0) + (hasUpcoming ? 1 : 0);

  return (
    <ContentSection title="Éditions françaises" count={totalCount}>
      {/* Prochaines sorties */}
      {hasUpcoming && (
        <div className="mb-6 p-4 rounded-sm border border-border/60">
          <p className="editorial-label mb-2">Prochaines sorties</p>
          <div className="space-y-1.5">
            {[...upcomingFR, ...upcomingOther].map((r, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{getCountryName(r.country)}</span>
                {" — "}
                <span className="text-foreground tabular-nums">{formatDateFr(r.date)}</span>{" "}
                <span className="editorial-label ml-1">
                  {r.type === "physical" ? "Physique" : "Digital"}
                </span>
                {r.note && <span className="text-xs ml-1">({r.note})</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Dates de sortie FR */}
      {(frPhysicalDate || frDigitalDate) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {frPhysicalDate && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-sm border border-border/60">
              <span className="editorial-label">Sortie physique FR</span>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {formatDateFr(frPhysicalDate)}
              </span>
            </div>
          )}
          {frDigitalDate && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-sm border border-border/60">
              <span className="editorial-label">Sortie digitale FR</span>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {formatDateFr(frDigitalDate)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Éditions françaises réelles */}
      {hasEditions ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topEditions.map((edition, i) => (
              <EditionCard key={`top-${i}`} edition={edition} featured />
            ))}
          </div>

          {restEditions.length > 0 && (
            <>
              {showAll && (
                <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-border/40">
                  {restEditions.map((edition, i) => (
                    <EditionCard key={`rest-${i}`} edition={edition} />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="editorial-label flex items-center gap-1 transition-colors hover:text-foreground"
              >
                {showAll
                  ? "Voir moins"
                  : `Voir ${restEditions.length} édition${restEditions.length > 1 ? "s" : ""} de plus`}
                <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", showAll && "rotate-180")} />
              </button>
            </>
          )}
        </div>
      ) : !hasUpcoming ? (
        <p className="text-muted-foreground py-4">
          Aucune édition française trouvée pour le moment.
        </p>
      ) : null}
    </ContentSection>
  );
}
