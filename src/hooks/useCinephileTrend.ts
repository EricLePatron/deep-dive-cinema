import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  getMovieDetails,
  getMovieCredits,
  discoverMovies,
  getPersonMovieCredits,
  getPosterUrl,
} from "@/services/tmdb";
import type { LetterboxdFilm } from "@/hooks/useLetterboxd";

export interface TrendFilm {
  id: number;
  title: string;
  year: number;
  posterUrl: string | null;
}

export interface CinephileTrend {
  dimension: "director" | "country" | "genre" | "decade";
  value: string;
  directorId?: number;
  score: number;
  filmCount: number;
  daySpan: number;
  editorialTitle: string;
  contextLine: string;
  suggestions: TrendFilm[];
}

const GENRE_BLACKLIST = new Set(
  ["drame", "comédie", "comedie", "action", "thriller", "drama", "comedy"].map((s) => s.toLowerCase())
);

const COUNTRY_ADJECTIVE_FR: Record<string, string> = {
  IR: "iranien",
  JP: "japonais",
  KR: "coréen",
  CN: "chinois",
  HK: "hongkongais",
  TW: "taïwanais",
  IN: "indien",
  IT: "italien",
  FR: "français",
  DE: "allemand",
  ES: "espagnol",
  PT: "portugais",
  GB: "britannique",
  US: "américain",
  MX: "mexicain",
  BR: "brésilien",
  AR: "argentin",
  RU: "russe",
  PL: "polonais",
  SE: "suédois",
  DK: "danois",
  NO: "norvégien",
  TR: "turc",
  GR: "grec",
  RO: "roumain",
  TH: "thaïlandais",
  VN: "vietnamien",
  AU: "australien",
  CA: "canadien",
  BE: "belge",
  NL: "néerlandais",
  CH: "suisse",
  AT: "autrichien",
  HU: "hongrois",
  CZ: "tchèque",
  IE: "irlandais",
  FI: "finlandais",
  IS: "islandais",
};

interface EnrichedFilm {
  tmdbId: number;
  watchedAt: number;
  weight: number;
  director?: { id: number; name: string };
  genres: { id: number; name: string }[];
  country?: { code: string; name: string };
  decade?: number;
}

interface DimensionTally {
  key: string;
  score: number;
  films: EnrichedFilm[];
  meta: Record<string, any>;
}

function buildEditorial(
  dimension: CinephileTrend["dimension"],
  value: string,
  meta: Record<string, any>
): string {
  switch (dimension) {
    case "director":
      return `Une obsession : ${value}`;
    case "country": {
      const adj = meta.code ? COUNTRY_ADJECTIVE_FR[meta.code] : undefined;
      return adj ? `Un voyage au cinéma ${adj}` : `Un voyage au cinéma — ${value}`;
    }
    case "genre":
      return `Une saison ${value.toLowerCase()}`;
    case "decade": {
      const d = Number(value);
      // Use full 4-digit year for 2000+ decades to avoid ambiguity ("Les années 20" = 1920s)
      const label = d >= 2000 ? String(d) : String(d).slice(-2);
      return `Les années ${label}`;
    }
  }
}

function contextLine(filmCount: number, daySpan: number): string {
  if (daySpan < 14) {
    const weeks = Math.max(1, Math.round(daySpan / 7));
    return `${filmCount} films en ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  }
  return `${filmCount} films en ${daySpan} jours`;
}

export function useCinephileTrend(letterboxdFilms: LetterboxdFilm[] | undefined) {
  const now = Date.now();
  const windowMs = 30 * 24 * 60 * 60 * 1000;

  const candidates = (letterboxdFilms ?? []).filter((f) => {
    if (!f.tmdbMovieId) return false;
    const ts = new Date(f.watchedDate || f.pubDate || 0).getTime();
    return ts > 0 && now - ts <= windowMs;
  });

  const diaryIds = new Set(
    (letterboxdFilms ?? []).map((f) => f.tmdbMovieId).filter((x): x is number => !!x)
  );

  const cacheKey = candidates
    .map((f) => `${f.tmdbMovieId}:${f.watchedDate}`)
    .sort()
    .join("|");

  return useQuery({
    queryKey: ["cinephile-trend", cacheKey],
    enabled: candidates.length >= 3,
    staleTime: 1000 * 60 * 30,
    queryFn: async (): Promise<CinephileTrend | null> => {
      // 1) Enrich each candidate
      const enriched: EnrichedFilm[] = await Promise.all(
        candidates.map(async (f) => {
          const ts = new Date(f.watchedDate || f.pubDate || 0).getTime();
          const ageDays = Math.max(0, (now - ts) / (24 * 60 * 60 * 1000));
          const weight = ageDays <= 7 ? 1.3 : 1.0;
          try {
            const [details, credits] = await Promise.all([
              getMovieDetails(f.tmdbMovieId!),
              getMovieCredits(f.tmdbMovieId!),
            ]);
            const dir = credits.crew.find((c) => c.job === "Director");
            const pc: any = (details as any).production_countries?.[0];
            const year = details.release_date ? new Date(details.release_date).getFullYear() : 0;
            return {
              tmdbId: f.tmdbMovieId!,
              watchedAt: ts,
              weight,
              director: dir ? { id: dir.id, name: dir.name } : undefined,
              genres: details.genres ?? [],
              country: pc ? { code: pc.iso_3166_1, name: pc.name } : undefined,
              decade: year ? Math.floor(year / 10) * 10 : undefined,
            };
          } catch {
            return {
              tmdbId: f.tmdbMovieId!,
              watchedAt: ts,
              weight,
              genres: [],
            };
          }
        })
      );

      // 2) Tally dimensions
      const directors = new Map<string, DimensionTally>();
      const countries = new Map<string, DimensionTally>();
      const genres = new Map<string, DimensionTally>();
      const decades = new Map<string, DimensionTally>();

      const bump = (
        map: Map<string, DimensionTally>,
        key: string,
        film: EnrichedFilm,
        meta: Record<string, any>
      ) => {
        const cur = map.get(key) ?? { key, score: 0, films: [], meta };
        cur.score += film.weight;
        cur.films.push(film);
        cur.meta = meta;
        map.set(key, cur);
      };

      for (const film of enriched) {
        if (film.director) {
          bump(directors, String(film.director.id), film, {
            id: film.director.id,
            name: film.director.name,
          });
        }
        if (film.country?.code) {
          bump(countries, film.country.code, film, {
            code: film.country.code,
            name: film.country.name,
          });
        }
        for (const g of film.genres) {
          if (GENRE_BLACKLIST.has(g.name.toLowerCase())) continue;
          bump(genres, String(g.id), film, { id: g.id, name: g.name });
        }
        if (film.decade) {
          bump(decades, String(film.decade), film, { decade: film.decade });
        }
      }

      const top = (m: Map<string, DimensionTally>): DimensionTally | null => {
        let best: DimensionTally | null = null;
        for (const t of m.values()) {
          if (!best || t.score > best.score) best = t;
        }
        return best;
      };

      const dirTop = top(directors);
      const countryTop = top(countries);
      const genreTop = top(genres);
      const decadeTop = top(decades);

      // Priority order: director > country > genre > decade.
      // Pick the FIRST (highest-priority) dimension whose score meets the threshold.
      // This ensures a strong director or country signal wins over a generic "decade"
      // signal even when the decade has a higher raw count (e.g. "2020s" = user watches
      // recent films — editorially uninteresting vs. "Italian cinema" or a director).
      const THRESHOLD = 2.5;
      const ordered: Array<[CinephileTrend["dimension"], DimensionTally | null]> = [
        ["director", dirTop],
        ["country", countryTop],
        ["genre", genreTop],
        ["decade", decadeTop],
      ];
      const chosen = ordered.find(([, t]) => t && t.score >= THRESHOLD);
      if (!chosen || !chosen[1]) return null;
      const [dimension, tally] = chosen;

      // 3) Find candidate suggestions via TMDB
      let pool: Array<{ id: number; title: string; year: number; posterUrl: string | null; vote_count?: number }> = [];
      try {
        if (dimension === "director") {
          const credits = await getPersonMovieCredits(tally.meta.id);
          pool = credits.crew
            .filter((c) => c.job === "Director" && (c.vote_count ?? 0) > 1000)
            .map((c) => ({
              id: c.id,
              title: c.title,
              year: c.release_date ? new Date(c.release_date).getFullYear() : 0,
              posterUrl: getPosterUrl(c.poster_path),
              vote_count: c.vote_count,
            }));
        } else if (dimension === "country") {
          const res = await discoverMovies({
            with_origin_country: tally.meta.code,
            sort_by: "vote_average.desc",
            "vote_count.gte": 300,
          });
          pool = res.results.map((m) => ({
            id: m.id,
            title: m.title,
            year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
            posterUrl: getPosterUrl(m.poster_path),
          }));
        } else if (dimension === "genre") {
          const res = await discoverMovies({
            with_genres: String(tally.meta.id),
            sort_by: "vote_average.desc",
            "vote_count.gte": 500,
          });
          pool = res.results.map((m) => ({
            id: m.id,
            title: m.title,
            year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
            posterUrl: getPosterUrl(m.poster_path),
          }));
        } else if (dimension === "decade") {
          const d = tally.meta.decade as number;
          const res = await discoverMovies({
            "primary_release_date.gte": `${d}-01-01`,
            "primary_release_date.lte": `${d + 9}-12-31`,
            sort_by: "vote_average.desc",
            "vote_count.gte": 500,
          });
          pool = res.results.map((m) => ({
            id: m.id,
            title: m.title,
            year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
            posterUrl: getPosterUrl(m.poster_path),
          }));
        }
      } catch {
        return null;
      }

      // Dedup + exclude diary films
      const seen = new Set<number>();
      const unique = pool.filter((m) => {
        if (seen.has(m.id)) return false;
        if (diaryIds.has(m.id)) return false;
        if (!m.posterUrl) return false;
        seen.add(m.id);
        return true;
      });

      if (unique.length === 0) return null;

      // 4) Filter by Deepdive richness — prefer films with Deepdive content,
      //    but fall back to top-rated TMDB pool if the table is sparse.
      //    film_content_stats is populated as users visit film pages; early in the
      //    product lifecycle it may have very few entries, so we never hard-block on it.
      const ids = unique.slice(0, 80).map((m) => m.id);
      const { data: stats } = await supabase
        .from("film_content_stats")
        .select("tmdb_id, video_count, podcast_count, book_count")
        .in("tmdb_id", ids);
      const statMap = new Map<number, { v: number; p: number; b: number }>();
      (stats ?? []).forEach((s: any) => {
        statMap.set(Number(s.tmdb_id), {
          v: s.video_count ?? 0,
          p: s.podcast_count ?? 0,
          b: s.book_count ?? 0,
        });
      });

      const rich = unique.filter((m) => {
        const s = statMap.get(m.id);
        if (!s) return false;
        return s.v >= 3 || (s.p >= 1 && s.b >= 1);
      });

      // Fallback: if fewer than 2 Deepdive-rich films found, use the top-rated
      // TMDB pool films regardless of content stats. Better to show great films
      // with sparse content than to hide the section entirely.
      const source = rich.length >= 2 ? rich : unique;
      if (source.length === 0) return null;

      const suggestions: TrendFilm[] = source.slice(0, 6).map((m) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        posterUrl: m.posterUrl,
      }));

      // 5) Build display
      const filmsInTrend = tally.films;
      const filmCount = filmsInTrend.length;
      const times = filmsInTrend.map((f) => f.watchedAt).sort((a, b) => a - b);
      const daySpan = Math.max(
        1,
        Math.round((times[times.length - 1] - times[0]) / (24 * 60 * 60 * 1000))
      );
      const value: string =
        dimension === "decade" ? String(tally.meta.decade) : tally.meta.name;

      return {
        dimension,
        value,
        directorId: dimension === "director" ? tally.meta.id : undefined,
        score: tally.score,
        filmCount,
        daySpan,
        editorialTitle: buildEditorial(dimension, value, tally.meta),
        contextLine: contextLine(filmCount, daySpan),
        suggestions,
      };
    },
  });
}