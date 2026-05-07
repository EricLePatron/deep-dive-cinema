import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type FavoriteType = "article" | "video" | "book" | "podcast";

export interface FavoriteFilm {
  film_tmdb_id: number | null;
  film_title: string | null;
  film_poster_url: string | null;
  film_year: number | null;
}

export interface FavoriteRecord extends FavoriteFilm {
  id: string;
  user_id: string;
  item_type: FavoriteType;
  item_id: string;
  item_data: any;
  created_at: string;
}

export interface AddFavoriteInput {
  itemType: FavoriteType;
  itemId: string;
  itemData: Record<string, any>;
  film?: {
    tmdbId?: number;
    title?: string;
    posterUrl?: string | null;
    year?: number;
  };
}

function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);
  return user;
}

export function useFavorites() {
  const user = useAuthUser();
  const qc = useQueryClient();

  const query = useQuery<FavoriteRecord[]>({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FavoriteRecord[];
    },
    enabled: !!user,
    staleTime: 1000 * 30,
  });

  const keySet = useMemo(() => {
    const m = new Map<string, FavoriteRecord>();
    (query.data ?? []).forEach((f) => m.set(`${f.item_type}:${f.item_id}`, f));
    return m;
  }, [query.data]);

  const add = useMutation({
    mutationFn: async (input: AddFavoriteInput) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        item_type: input.itemType,
        item_id: input.itemId,
        item_data: input.itemData,
        film_tmdb_id: input.film?.tmdbId ?? null,
        film_title: input.film?.title ?? null,
        film_poster_url: input.film?.posterUrl ?? null,
        film_year: input.film?.year ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const remove = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: FavoriteType; itemId: string }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const isFavorite = (itemType: FavoriteType, itemId: string) =>
    keySet.has(`${itemType}:${itemId}`);

  const toggle = async (input: AddFavoriteInput) => {
    if (isFavorite(input.itemType, input.itemId)) {
      await remove.mutateAsync({ itemType: input.itemType, itemId: input.itemId });
      return false;
    }
    await add.mutateAsync(input);
    return true;
  };

  return {
    user,
    favorites: query.data ?? [],
    isLoading: query.isLoading,
    isFavorite,
    add: add.mutateAsync,
    remove: remove.mutateAsync,
    toggle,
    isPending: add.isPending || remove.isPending,
  };
}