import { Disc3, ExternalLink, Calendar, ShoppingBag, AlertCircle, Store, Search } from "lucide-react";
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
  filmYear: number;
}

const FORMAT_COLORS: Record<string, string> = {
  "4K UHD": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Blu-ray": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "DVD": "bg-muted text-muted-foreground border-border",
  "Collector": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const RETAILER_COLORS: Record<string, string> = {
  "Potemkine": "text-orange-400",
  "Carlotta Films": "text-rose-400",
  "Fnac": "text-yellow-400",
  "Amazon.fr": "text-sky-400",
  "Wild Side": "text-emerald-400",
  "Spectrum Films": "text-violet-400",
};

export function PhysicalMediaSection({ movieId, filmTitle, filmYear }: PhysicalMediaSectionProps) {
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
  } = useFrenchEditions(filmTitle, filmYear, true);

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

  // Group editions by format
  const editionsByFormat = (frenchEditions || []).reduce<Record<string, FrenchEdition[]>>((acc, ed) => {
    if (!acc[ed.format]) acc[ed.format] = [];
    acc[ed.format].push(ed);
    return acc;
  }, {});

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
        <div className="space-y-6">
          {Object.entries(editionsByFormat).map(([format, editions]) => (
            <div key={format}>
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className={cn("text-xs font-semibold", FORMAT_COLORS[format] || FORMAT_COLORS["DVD"])}
                >
                  {format}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {editions.length} édition{editions.length > 1 ? "s" : ""} trouvée{editions.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-3">
                {editions.map((edition, i) => (
                  <a
                    key={i}
                    href={edition.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/50 hover:border-primary/30 hover:bg-muted/40 transition-all"
                  >
                    <Store className={cn("h-5 w-5 mt-0.5 flex-shrink-0", RETAILER_COLORS[edition.retailer] || "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm leading-tight truncate">
                            {edition.title}
                          </p>
                          <p className={cn("text-xs font-medium mt-0.5", RETAILER_COLORS[edition.retailer] || "text-muted-foreground")}>
                            {edition.retailer}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      {edition.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                          {edition.description}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !hasUpcoming ? (
        <p className="text-muted-foreground py-4">
          Aucune édition française trouvée pour le moment.
        </p>
      ) : null}
    </ContentSection>
  );
}
