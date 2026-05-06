import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export interface LetterboxdFilm {
  title: string;
  filmTitle: string;
  filmYear: string;
  rating: number;
  watchedDate: string;
  link: string;
  tmdbMovieId: number | null;
  pubDate: string;
}

export function useLetterboxdProfile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const profileQuery = useQuery({
    queryKey: ["letterboxd-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("letterboxd_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return { profile: profileQuery.data, isLoading: profileQuery.isLoading, user };
}

export function useSaveLetterboxdUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, username }: { userId: string; username: string }) => {
      const { data, error } = await supabase
        .from("letterboxd_profiles")
        .upsert({ user_id: userId, username, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letterboxd-profile"] });
      queryClient.invalidateQueries({ queryKey: ["letterboxd-feed"] });
    },
  });
}

export function useDeleteLetterboxdProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("letterboxd_profiles")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letterboxd-profile"] });
      queryClient.invalidateQueries({ queryKey: ["letterboxd-feed"] });
    },
  });
}

export function useLetterboxdFeed(username: string | undefined) {
  return useQuery({
    queryKey: ["letterboxd-feed", username],
    queryFn: async (): Promise<LetterboxdFilm[]> => {
      const { data, error } = await supabase.functions.invoke("letterboxd-feed", {
        body: { username },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data.films;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
}
