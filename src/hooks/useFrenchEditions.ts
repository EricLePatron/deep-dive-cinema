import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FrenchEdition {
  url: string;
  title: string;
  description: string;
  retailer: string;
  format: string;
}

async function searchFrenchEditions(filmTitle: string, filmYear: number, originalTitle?: string): Promise<FrenchEdition[]> {
  const { data, error } = await supabase.functions.invoke("french-editions-search", {
    body: { filmTitle, filmYear, originalTitle },
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Search failed");
  return data.editions || [];
}

export function useFrenchEditions(filmTitle: string, filmYear: number, enabled: boolean, originalTitle?: string) {
  return useQuery({
    queryKey: ["french-editions", filmTitle, filmYear, originalTitle],
    queryFn: () => searchFrenchEditions(filmTitle, filmYear, originalTitle),
    enabled: enabled && !!filmTitle,
    staleTime: 1000 * 60 * 60, // 1h cache
    retry: 1,
  });
}
