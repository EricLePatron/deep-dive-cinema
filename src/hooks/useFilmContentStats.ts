import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FilmContentStat {
  tmdb_id: number;
  video_count: number;
  podcast_count: number;
  book_count: number;
}

// Thresholds defined by the editorial brief
export const RICHNESS = {
  videos: 5,
  podcasts: 3,
  books: 2,
};

export function isFilmRich(s?: FilmContentStat | null) {
  if (!s) return false;
  let n = 0;
  if (s.video_count >= RICHNESS.videos) n++;
  if (s.podcast_count >= RICHNESS.podcasts) n++;
  if (s.book_count >= RICHNESS.books) n++;
  return n >= 2;
}

export function useFilmContentStats(tmdbIds: number[]) {
  const key = tmdbIds.slice().sort((a, b) => a - b).join(",");
  return useQuery({
    queryKey: ["film-content-stats", key],
    enabled: tmdbIds.length > 0,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("film_content_stats")
        .select("tmdb_id, video_count, podcast_count, book_count")
        .in("tmdb_id", tmdbIds);
      if (error) throw error;
      const map = new Map<number, FilmContentStat>();
      (data ?? []).forEach((r: any) => map.set(Number(r.tmdb_id), r));
      return map;
    },
  });
}

interface UpsertArgs {
  tmdbId?: number;
  videoCount: number;
  podcastCount: number;
  bookCount: number;
  ready: boolean;
}

// Lazily store content counts so the homepage can filter trending films.
export function useUpsertFilmContentStats({ tmdbId, videoCount, podcastCount, bookCount, ready }: UpsertArgs) {
  useEffect(() => {
    if (!ready || !tmdbId) return;
    supabase
      .from("film_content_stats")
      .upsert(
        {
          tmdb_id: tmdbId,
          video_count: videoCount,
          podcast_count: podcastCount,
          book_count: bookCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tmdb_id" }
      )
      .then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, ready, videoCount, podcastCount, bookCount]);
}
