import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Film, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSelectFilm = (film: { id: number; title: string }) => {
    navigate(`/film/${film.id}`);
    setSearchOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isHome ? "bg-transparent" : "glass-panel"
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              Deep<span className="text-primary">Dive</span>
            </span>
          </Link>

          {/* Center search bar (expanded) */}
          {searchOpen && (
            <div className="absolute inset-x-0 top-0 h-16 flex items-center px-6 bg-background/95 backdrop-blur-xl z-50">
              <div className="container mx-auto flex items-center gap-3">
                <div className="flex-1">
                  <SearchBar onSelectFilm={handleSelectFilm} variant="header" />
                </div>
                <Button
                  variant="cinema-ghost"
                  size="icon"
                  className="rounded-full flex-shrink-0"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isHome ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Explore
            </Link>
            <Link
              to="/directors"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Directors
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="cinema-ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="cinema-outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
