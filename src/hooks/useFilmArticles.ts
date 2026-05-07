import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FilmArticle {
  id: string;
  url: string;
  title: string;
  description: string;
  source: string;
  sourceKind: "specialized" | "press";
  sourceTier: 1 | 2;
  sourceLang: "fr" | "en";
  sourceFormat: "critique" | "archive" | "dossier-pdf";
  sourceFree: boolean;
  image: string | null;
}

export function useFilmArticles(
  filmTitle?: string,
  filmYear?: number,
  originalTitle?: string,
  director?: string,
) {
  return useQuery({
    queryKey: ["film-articles", filmTitle, filmYear, originalTitle, director],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("article-search", {
        body: { filmTitle, filmYear, originalTitle, director },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Article search failed");
      return (data.articles || []) as FilmArticle[];
    },
    enabled: !!filmTitle,
    staleTime: 1000 * 60 * 60,
  });
}