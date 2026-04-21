import { Disc3, ExternalLink, Calendar, AlertCircle, Store, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContentSection } from "@/components/ContentSection";
import { Badge } from "@/components/ui/badge";
import { usePhysicalMedia } from "@/hooks/usePhysicalMedia";
import { useFrenchEditions, type FrenchEdition } from "@/hooks/useFrenchEditions";
import { getCountryName } from "@/services/tmdbReleases";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhysicalMediaSectionProps {
  movieId: number;
  filmTitle: string;
  originalTitle?: string;
  filmYear: number;
}

const FORMAT_COLORS: Record<string, string> = {
  "4K UHD": "bg-foreground/10 text-foreground border-foreground/20",
  "Blu-ray": "bg-muted/50 text-foreground border-border",
  "DVD": "bg-muted/30 text-muted-foreground border-border/60",
  "Collector": "bg-foreground/10 text-foreground border-foreground/20",
};

const RETAILER_COLORS: Record<string, string> = {
  "Potemkine": "text-foreground",
  "Carlotta Films": "text-foreground",
  "Fnac": "text-foreground",
  "Amazon.fr": "text-foreground",
  "Wild Side": "text-foreground",
  "Spectrum Films": "text-foreground",
};

const TOP_COUNT = 3;

function EditionCard({ edition, featured = false }: { edition: FrenchEdition; featured?: boolean }) {
  return (
    <a
      href={edition.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex gap-4 rounded-xl bg-muted/20 border border-border/50 hover:border-primary/40 hover:bg-muted/40 transition-all overflow-hidden",
        featured ? "p-4" : "p-3"
      )}
    >
      {edition.image ? (
        <img
          src={edition.image}
          alt={edition.title}
          loading="lazy"
          className={cn(
            "object-cover rounded-md flex-shrink-0 bg-muted shadow-md",
            featured ? "w-28 h-36" : "w-16 h-20"
          )}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            img.parentElement?.querySelector('[data-fallback]')?.removeAttribute('hidden');
          }}
        />
      ) : null}
      {!edition.image && (
        <div
          data-fallback
          className={cn(
            "flex items-center justify-center rounded-md flex-shrink-0 bg-muted/50",
            featured ? "w-28 h-36" : "w-16 h-20"
          )}
        >
          <Store className={cn("h-6 w-6", RETAILER_COLORS[edition.retailer] || "text-muted-foreground")} />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px] font-semibold", FORMAT_COLORS[edition.format] || FORMAT_COLORS["DVD"])}
            >
              {edition.format}
            </Badge>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className={cn(
            "font-medium text-foreground leading-tight mt-2 line-clamp-2",
            featured ? "text-sm" : "text-xs"
          )}>
            {edition.title}
          </p>
          {featured && edition.description && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
              {edition.description}
            </p>
          )}
        </div>
        <p className={cn(
          "font-medium mt-2",
          featured ? "text-xs" : "text-[11px]",
          RETAILER_COLORS[edition.retailer] || "text-muted-foreground"
        )}>
          {edition.retailer}
        </p>
      </div>
    </a>
  );
}

export function PhysicalMediaSection({ movieId, filmTitle, originalTitle, filmYear }: PhysicalMediaSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const {
    upcomingReleases,
    hasPhysicalRelease,
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
      <ContentSection title="Éditions françaises" icon={<Disc3 className="h-5 w-5" />} count={0}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
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
    <ContentSection
      title="Éditions françaises"
      icon={<Disc3 className="h-5 w-5" />}
      count={totalCount}
    >
      {/* Upcoming releases banner */}
      {hasUpcoming && (
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground mb-2">Prochaines sorties</h4>
              <div className="space-y-1.5">
                {[...upcomingFR, ...upcomingOther].map((r, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{getCountryName(r.country)}</span>
                    {" — "}
                    <span className="text-primary">
                      {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    {" "}
                    <Badge variant="outline" className="text-xs ml-1">
                      {r.type === "physical" ? "Physique" : "Digital"}
                    </Badge>
                    {r.note && <span className="text-xs ml-1">({r.note})</span>}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Release dates summary */}
      {(frPhysicalDate || frDigitalDate) && (
        <div className="flex flex-wrap gap-4 mb-6">
          {frPhysicalDate && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Sortie physique FR :</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(frPhysicalDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          )}
          {frDigitalDate && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Sortie digitale FR :</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(frDigitalDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Real French editions from search */}
      {hasEditions ? (
        <div className="space-y-4">
          {/* Featured: top relevant editions */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topEditions.map((edition, i) => (
              <EditionCard key={`top-${i}`} edition={edition} featured />
            ))}
          </div>

          {/* Rest: collapsed */}
          {restEditions.length > 0 && (
            <>
              {showAll && (
                <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-border/40">
                  {restEditions.map((edition, i) => (
                    <EditionCard key={`rest-${i}`} edition={edition} />
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll((v) => !v)}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                {showAll ? "Voir moins" : `Voir ${restEditions.length} édition${restEditions.length > 1 ? "s" : ""} de plus`}
                <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", showAll && "rotate-180")} />
              </Button>
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
