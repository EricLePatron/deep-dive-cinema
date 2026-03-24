import { useQuery } from "@tanstack/react-query";
import {
  getMovieReleaseDates,
  extractPhysicalReleases,
  generateEditions,
} from "@/services/tmdbReleases";

export function usePhysicalMedia(movieId: number | undefined, filmTitle: string, filmYear: number) {
  const { data: releaseDates, isLoading } = useQuery({
    queryKey: ["tmdb", "release-dates", movieId],
    queryFn: () => getMovieReleaseDates(movieId!),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 30,
  });

  const physicalReleases = releaseDates ? extractPhysicalReleases(releaseDates) : [];
  const hasPhysicalRelease = physicalReleases.some((r) => r.type === "physical" && r.isPast);
  const upcomingReleases = physicalReleases.filter((r) => !r.isPast);
  const editions = generateEditions(filmTitle, filmYear, hasPhysicalRelease);

  // Get digital release info
  const digitalReleases = physicalReleases.filter((r) => r.type === "digital");
  const frPhysical = physicalReleases.find((r) => r.country === "FR" && r.type === "physical");
  const frDigital = digitalReleases.find((r) => r.country === "FR");

  return {
    physicalReleases,
    upcomingReleases,
    editions,
    hasPhysicalRelease,
    frPhysicalDate: frPhysical?.date,
    frDigitalDate: frDigital?.date,
    isLoading,
  };
}
