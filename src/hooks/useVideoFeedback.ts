import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type VideoRating = "up" | "down";

export interface VideoFeedbackRow {
  video_id: string;
  film_tmdb_id: number | null;
  rating: VideoRating;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);
  return user;
}

export function useVideoFeedback() {
  const user = useCurrentUser();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["video-feedback", user?.id],
    queryFn: async (): Promise<VideoFeedbackRow[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("video_feedback")
        .select("video_id, film_tmdb_id, rating");
      if (error) throw error;
      return (data || []) as VideoFeedbackRow[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const setFeedback = useMutation({
    mutationFn: async (params: {
      videoId: string;
      filmTmdbId?: number;
      rating: VideoRating | null;
    }) => {
      if (!user) throw new Error("Vous devez être connecté pour évaluer une vidéo.");
      if (params.rating === null) {
        const { error } = await supabase
          .from("video_feedback")
          .delete()
          .eq("user_id", user.id)
          .eq("video_id", params.videoId);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("video_feedback").upsert(
        {
          user_id: user.id,
          video_id: params.videoId,
          film_tmdb_id: params.filmTmdbId ?? null,
          rating: params.rating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,video_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-feedback"] });
      qc.invalidateQueries({ queryKey: ["video-feedback-stats"] });
      qc.invalidateQueries({ queryKey: ["diary-content-highlights"] });
    },
  });

  const rows = query.data || [];
  const ratings = new Map<string, VideoRating>();
  for (const r of rows) ratings.set(r.video_id, r.rating);
  const downIds = new Set(rows.filter((r) => r.rating === "down").map((r) => r.video_id));
  const upIds = new Set(rows.filter((r) => r.rating === "up").map((r) => r.video_id));

  return {
    user,
    ratings,
    downIds,
    upIds,
    setFeedback: setFeedback.mutateAsync,
    isPending: setFeedback.isPending,
  };
}
