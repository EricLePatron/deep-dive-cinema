import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import { useLetterboxdProfile, useLetterboxdFeed } from "@/hooks/useLetterboxd";
import { getMovieDetails, searchMovies, getPosterUrl } from "@/services/tmdb";
import { cn } from "@/lib/utils";

const Diary = () => {
  const { profile, user, isLoading: loadingProfile } = useLetterboxdProfile();
  const { data: films, isLoading: loadingFeed } = useLetterboxdFeed(profile?.username);

  // Keep only films watched in the last 30 days
  const recent = useMemo(() => {
    if (!films) return [];
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return [...films]
      .filter((f) => {
        const t = new Date(f.watchedDate || f.pubDate || 0).getTime();
        return t >= cutoff;
      })
      .sort((a, b) => {
        const da = new Date(a.watchedDate || a.pubDate || 0).getTime();
        const db = new Date(b.watchedDate || b.pubDate || 0).getTime();
        return db - da;
      });
  }, [films]);

  const recentKey = recent.map((f) => `${f.tmdbMovieId ?? f.filmTitle}:${f.watchedDate}`).join("|");

  const { data: enriched, isLoading: loadingEnriched } = useQuery({
    queryKey: ["diary-30d", recentKey],
    queryFn: async () => {
      const out: Array<{
        id: number;
        title: string;
        year: number;
        posterUrl: string | null;
        rating: number;
        watchedDate: string;
      }> = [];
      const seen = new Set<number>();
      for (const film of recent) {
        let match: any = null;
        if (film.tmdbMovieId) {
          try {
            match = await getMovieDetails(film.tmdbMovieId);
          } catch {
            match = null;
          }
        }
        if (!match) {
          try {
            const search = await searchMovies(film.filmTitle);
            match =
              search.results.find((m: any) => m.release_date?.startsWith(film.filmYear)) ||
              search.results[0];
          } catch {
            match = null;
          }
        }
        if (!match || seen.has(match.id)) continue;
        seen.add(match.id);
        out.push({
          id: match.id,
          title: match.title,
          year: match.release_date ? new Date(match.release_date).getFullYear() : 0,
          posterUrl: getPosterUrl(match.poster_path, "w342"),
          rating: film.rating,
          watchedDate: film.watchedDate,
        });
      }
      return out;
    },
    enabled: recent.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = loadingProfile || loadingFeed || loadingEnriched;

  return (
    <div className="dark min-h-screen bg-background safe-top safe-bottom">
      <Header />

      <section className="pt-28 md:pt-32 pb-10 px-6 border-b border-border">
        <div className="container mx-auto max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 editorial-label text-foreground/60 hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Accueil
          </Link>
          <div className="editorial-label mb-3">— Votre diary Letterboxd</div>
          <h1 className="font-display text-4xl md:text-6xl text-foreground tracking-tight leading-[0.95] mb-4">
            30 derniers jours
          </h1>
          {profile && (
            <p className="text-sm md:text-base text-foreground/60 font-light">
              @{profile.username} · {enriched?.length ?? 0} film{(enriched?.length ?? 0) > 1 ? "s" : ""} vus
            </p>
          )}
        </div>
      </section>

      <section className="py-10 md:py-14 px-6">
        <div className="container mx-auto max-w-5xl">
          {!user || !profile ? (
            <p className="text-foreground/70 font-light">
              Reliez votre compte Letterboxd depuis l'accueil pour voir votre diary.
            </p>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          ) : !enriched || enriched.length === 0 ? (
            <p className="text-foreground/70 font-light">
              Aucun film vu sur Letterboxd ces 30 derniers jours.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {enriched.map((f) => (
                <li key={`${f.id}-${f.watchedDate}`}>
                  <Link
                    to={`/film/${f.id}`}
                    className="flex items-center gap-4 md:gap-6 py-4 md:py-5 group"
                  >
                    <div className="w-12 h-[72px] md:w-16 md:h-24 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                      {f.posterUrl && (
                        <img
                          src={f.posterUrl}
                          alt={f.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-xl md:text-2xl text-foreground tracking-tight truncate group-hover:opacity-80 transition-opacity">
                        {f.title}
                        {f.year > 0 && (
                          <span className="text-foreground/50 font-light tabular-nums ml-2">
                            {f.year}
                          </span>
                        )}
                      </h2>
                      <div className="mt-1.5 flex items-center gap-3 editorial-label text-foreground/60">
                        <span className="tabular-nums">{formatDate(f.watchedDate)}</span>
                        {f.rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < Math.round(f.rating)
                                    ? "text-foreground fill-foreground"
                                    : "text-foreground/20"
                                )}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="hidden md:inline editorial-label text-foreground/40 group-hover:text-foreground transition-colors">
                      Deep dive →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

function formatDate(iso: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export default Diary;