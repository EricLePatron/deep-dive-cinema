// TMDB Release Dates & Physical Media Service
const TMDB_API_KEY = "b89fc45c2067cbd33560270639722eae";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Release types: 1=Premiere, 2=Theatrical(limited), 3=Theatrical, 4=Digital, 5=Physical, 6=TV
export interface TMDBReleaseDate {
  certification: string;
  iso_639_1: string;
  note: string;
  release_date: string;
  type: number;
}

export interface TMDBReleaseDateCountry {
  iso_3166_1: string;
  release_dates: TMDBReleaseDate[];
}

export interface TMDBReleaseDatesResponse {
  id: number;
  results: TMDBReleaseDateCountry[];
}

export interface PhysicalRelease {
  country: string;
  date: string;
  note: string;
  type: "physical" | "digital";
  isPast: boolean;
}

export interface PhysicalEdition {
  format: string;
  label: string;
  icon: string;
  buyUrl: string;
}

export async function getMovieReleaseDates(movieId: number): Promise<TMDBReleaseDatesResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/release_dates?api_key=${TMDB_API_KEY}`
  );
  if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
  return response.json();
}

export function extractPhysicalReleases(data: TMDBReleaseDatesResponse): PhysicalRelease[] {
  const now = new Date();
  const releases: PhysicalRelease[] = [];

  for (const country of data.results) {
    for (const rd of country.release_dates) {
      if (rd.type === 4 || rd.type === 5) {
        const date = new Date(rd.release_date);
        releases.push({
          country: country.iso_3166_1,
          date: rd.release_date,
          note: rd.note,
          type: rd.type === 5 ? "physical" : "digital",
          isPast: date <= now,
        });
      }
    }
  }

  // Sort: upcoming first (by date asc), then past (by date desc)
  releases.sort((a, b) => {
    if (!a.isPast && b.isPast) return -1;
    if (a.isPast && !b.isPast) return 1;
    if (!a.isPast) return new Date(a.date).getTime() - new Date(b.date).getTime();
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return releases;
}

export function generateEditions(filmTitle: string, year: number, hasPhysicalRelease: boolean): PhysicalEdition[] {
  if (!hasPhysicalRelease) return [];

  const encodedTitle = encodeURIComponent(`${filmTitle} ${year}`);

  return [
    {
      format: "4K UHD",
      label: "4K Ultra HD Blu-ray",
      icon: "4k",
      buyUrl: `https://www.amazon.fr/s?k=${encodeURIComponent(`${filmTitle} 4K UHD Blu-ray`)}&tag=cinema`,
    },
    {
      format: "Blu-ray",
      label: "Édition Blu-ray",
      icon: "bluray",
      buyUrl: `https://www.amazon.fr/s?k=${encodeURIComponent(`${filmTitle} Blu-ray`)}&tag=cinema`,
    },
    {
      format: "DVD",
      label: "Édition DVD",
      icon: "dvd",
      buyUrl: `https://www.amazon.fr/s?k=${encodeURIComponent(`${filmTitle} DVD`)}&tag=cinema`,
    },
    {
      format: "Collector",
      label: "Édition Collector / Steelbook",
      icon: "collector",
      buyUrl: `https://www.amazon.fr/s?k=${encodeURIComponent(`${filmTitle} steelbook collector`)}&tag=cinema`,
    },
  ];
}

const COUNTRY_NAMES: Record<string, string> = {
  FR: "France",
  US: "États-Unis",
  GB: "Royaume-Uni",
  DE: "Allemagne",
  JP: "Japon",
  IT: "Italie",
  ES: "Espagne",
  CA: "Canada",
  AU: "Australie",
  BR: "Brésil",
};

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}
