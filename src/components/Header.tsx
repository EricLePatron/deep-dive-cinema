import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { LetterboxdLink } from "@/components/LetterboxdLink";
import { cn } from "@/lib/utils";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignIn = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSelectFilm = (film: { id: number; title: string }) => {
    navigate(`/film/${film.id}`);
    setSearchOpen(false);
  };

  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent border-b border-transparent"
          : "bg-background/85 backdrop-blur-md border-b border-border"
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark logo */}
          <Link to="/" className="group flex-shrink-0">
            <span className="font-display text-2xl font-semibold tracking-tight leading-none">
              Deep<span className="italic font-normal">dive</span>
            </span>
          </Link>

          {/* Center search bar (expanded) */}
          {searchOpen && (
            <div className="absolute inset-x-0 top-0 h-14 flex items-center px-6 bg-background/95 backdrop-blur-xl z-50 border-b border-border">
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

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="cinema-ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </Button>
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <LetterboxdLink />
                <img
                  src={user.user_metadata?.avatar_url}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
                <Button variant="cinema-ghost" size="icon" className="rounded-full" onClick={handleSignOut} aria-label="Se déconnecter">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="cinema-outline" size="sm" onClick={handleSignIn} className="ml-2 editorial-label !text-[11px]">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
