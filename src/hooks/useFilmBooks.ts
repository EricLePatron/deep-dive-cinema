import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BookResult {
  id: string;
  title: string;
  authors: string[];
  description: string;
  publisher: string;
  publishedDate: string;
  imageUrl: string | null;
  infoLink: string;
  category: 'film' | 'director' | 'genre';
  relevanceScore: number;
  language: string;
  isbn: string | null;
  retailers: { name: string; url: string }[];
}

interface BookSearchResponse {
  books: BookResult[];
}

const categoryLabels: Record<BookResult['category'], string> = {
  film: 'Sur ce film',
  director: 'Sur le réalisateur',
  genre: 'Sur le genre',
};

export { categoryLabels };

export function useFilmBooks(
  filmTitle: string,
  originalTitle?: string,
  director?: string,
  genres?: string[]
) {
  return useQuery({
    queryKey: ['film-books', filmTitle, director],
    queryFn: async (): Promise<BookResult[]> => {
      const { data, error } = await supabase.functions.invoke('book-search', {
        body: { filmTitle, originalTitle, director, genres },
      });

      if (error) throw error;
      return (data as BookSearchResponse).books || [];
    },
    enabled: !!filmTitle,
    staleTime: 1000 * 60 * 30,
  });
}
