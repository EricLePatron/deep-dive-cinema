import { Link, useLocation } from "react-router-dom";
import { Film, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isHome
          ? "bg-transparent"
          : "glass-panel"
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              Deep<span className="text-primary">Dive</span>
            </span>
          </Link>

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
            <Button variant="cinema-ghost" size="icon" className="rounded-full">
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
