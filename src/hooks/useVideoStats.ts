import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VideoStat {
  ups: number;
  downs: number;
}

export function useVideoStats(videoIds: string[]) {
  const sortedIds = [...videoIds].sort();
  return useQuery({
    queryKey: ["video-feedback-stats", sortedIds],
    queryFn: async (): Promise<Map<string, VideoStat>> => {
      if (sortedIds.length === 0) return new Map();
      const { data, error } = await supabase.rpc("get_video_feedback_stats", {
        video_ids: sortedIds,
      });
      if (error) throw error;
      const m = new Map<string, VideoStat>();
      for (const row of (data || []) as Array<{ video_id: string; ups: number; downs: number }>) {
        m.set(row.video_id, { ups: Number(row.ups), downs: Number(row.downs) });
      }
      return m;
    },
    enabled: sortedIds.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

// Threshold: if a video accumulates this many net downvotes globally, hide it.
export const GLOBAL_HIDE_THRESHOLD = 3;

export function applyFeedbackRanking<T extends { id: string }>(
  videos: T[],
  opts: {
    stats: Map<string, VideoStat>;
    userDownIds: Set<string>;
    userUpIds: Set<string>;
  }
): T[] {
  const { stats, userDownIds, userUpIds } = opts;
  // 1. Hard hide: user downvoted, or globally heavily downvoted
  const visible = videos.filter((v) => {
    if (userDownIds.has(v.id)) return false;
    const s = stats.get(v.id);
    if (s && s.downs - s.ups >= GLOBAL_HIDE_THRESHOLD) return false;
    return true;
  });
  // 2. Re-rank with feedback signal
  return [...visible].sort((a, b) => {
    const sa = stats.get(a.id) ?? { ups: 0, downs: 0 };
    const sb = stats.get(b.id) ?? { ups: 0, downs: 0 };
    const score = (id: string, s: VideoStat) =>
      (userUpIds.has(id) ? 100 : 0) + (s.ups - s.downs) * 5;
    return score(b.id, sb) - score(a.id, sa);
  });
}
