import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FrenchEdition {
  url: string;
  title: string;
  description: string;
  retailer: string;
  format: string;
}

async function searchFrenchEditions(filmTitle: string, filmYear: number): Promise<FrenchEdition[]> {
  const { data, error } = await supabase.functions.invoke("french-editions-search", {
    body: { filmTitle, filmYear },
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.error || "Search failed");
  return data.editions || [];
}

export function useFrenchEditions(filmTitle: string, filmYear: number, enabled: boolean) {
  return useQuery({
    queryKey: ["french-editions", filmTitle, filmYear],
    queryFn: () => searchFrenchEditions(filmTitle, filmYear),
    enabled: enabled && !!filmTitle,
    staleTime: 1000 * 60 * 60, // 1h cache
    retry: 1,
  });
}
