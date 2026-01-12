import { useState, useRef, useEffect } from "react";
import { Search, Film, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { popularFilms, Film as FilmType } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSelectFilm?: (film: FilmType) => void;
  variant?: "hero" | "header";
}

export function SearchBar({ onSelectFilm, variant = "hero" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<FilmType[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      // Mock search - in real app, this would call TMDB API
      const filtered = popularFilms.filter(
        (film) =>
          film.title.toLowerCase().includes(query.toLowerCase()) ||
          film.director.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (film: FilmType) => {
    onSelectFilm?.(film);
    setQuery("");
    setIsOpen(false);
  };

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={cn("relative w-full", isHero ? "max-w-2xl" : "max-w-md")}>
      <div className="relative">
        <Search
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
            isHero ? "h-5 w-5" : "h-4 w-4"
          )}
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a film to explore..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
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
                {film.posterUrl ? (
                  <img
                    src={film.posterUrl}
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
                  {film.year} • {film.director}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl shadow-black/40 p-6 text-center z-50 animate-fade-in">
          <Film className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No films found for "{query}"</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
