import { useState, useRef, useEffect } from "react";
import { Search, Film, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchMovies } from "@/hooks/useTMDB";
import { getPosterUrl, TMDBSearchResult } from "@/services/tmdb";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  onSelectFilm?: (film: { id: number; title: string }) => void;
  variant?: "hero" | "header";
}

export function SearchBar({ onSelectFilm, variant = "hero" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useSearchMovies(debouncedQuery);
  const results = data?.results.slice(0, 8) || [];

  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (film: TMDBSearchResult) => {
    onSelectFilm?.({ id: film.id, title: film.title });
    setQuery("");
    setIsOpen(false);
  };

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={cn("relative w-full", isHero ? "max-w-2xl" : "max-w-md")}>
      <div className="relative">
        {isLoading ? (
          <Loader2
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-primary animate-spin",
              isHero ? "h-5 w-5" : "h-4 w-4"
            )}
          />
        ) : (
          <Search
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
              isHero ? "h-5 w-5" : "h-4 w-4"
            )}
          />
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder="Rechercher un film à explorer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => debouncedQuery.length > 0 && setIsOpen(true)}
          variant="cinema-search"
          inputSize={isHero ? "xl" : "lg"}
          className={cn(
            "pl-12 pr-10",
            isHero && "rounded-2xl shadow-2xl shadow-black/30"
          )}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fade-in">
          {results.map((film, index) => (
            <button
              key={film.id}
              onClick={() => handleSelect(film)}
              className={cn(
                "w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left",
                index !== results.length - 1 && "border-b border-border/50"
              )}
            >
              <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                {film.poster_path ? (
                  <img
                    src={getPosterUrl(film.poster_path, "w185") || ""}
                    alt={film.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">{film.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {film.release_date ? new Date(film.release_date).getFullYear() : "Unknown year"}
                  {film.vote_average > 0 && ` • ★ ${film.vote_average.toFixed(1)}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && debouncedQuery.length > 0 && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl shadow-black/40 p-6 text-center z-50 animate-fade-in">
          <Film className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No films found for "{debouncedQuery}"</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
