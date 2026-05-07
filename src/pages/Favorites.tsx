import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Film as FilmIcon, FileText, Video, Book, Headphones } from "lucide-react";
import { Header } from "@/components/Header";
import { useFavorites, FavoriteRecord, FavoriteType } from "@/hooks/useFavorites";
import { ArticleCard } from "@/components/ArticleCard";
import { BookCard } from "@/components/BookCard";
import { PodcastCard } from "@/components/PodcastCard";
import { YouTubeVideoCard } from "@/components/YouTubeVideoCard";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TYPE_META: Record<FavoriteType | "all", { label: string; icon: any }> = {
  all: { label: "Tout", icon: Bookmark },
  article: { label: "Articles", icon: FileText },
  video: { label: "Vidéos", icon: Video },
  book: { label: "Livres", icon: Book },
  podcast: { label: "Podcasts", icon: Headphones },
};

function renderItem(fav: FavoriteRecord) {
  const data = fav.item_data || {};
  switch (fav.item_type) {
    case "article":
      return <ArticleCard article={data} />;
    case "book":
      return <BookCard book={data} />;
    case "podcast":
      return <PodcastCard episode={data} />;
    case "video":
      return <YouTubeVideoCard video={data} filmTmdbId={fav.film_tmdb_id ?? undefined} />;
    default:
      return null;
  }
}

function FilmHeader({ fav }: { fav: { film_tmdb_id: number | null; film_title: string | null; film_poster_url: string | null; film_year: number | null } }) {
  if (!fav.film_tmdb_id || !fav.film_title) {
    return (
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
        <div className="w-10 h-14 bg-muted rounded-sm flex items-center justify-center">
          <FilmIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="font-display text-lg text-foreground">Sans film associé</span>
      </div>
    );
  }
  return (
    <Link
      to={`/film/${fav.film_tmdb_id}`}
      className="group flex items-center gap-4 mb-5 pb-4 border-b border-border hover:opacity-80 transition-opacity"
    >
      <div className="w-12 h-16 rounded-sm overflow-hidden bg-muted ring-1 ring-border flex-shrink-0">
        {fav.film_poster_url ? (
          <img src={fav.film_poster_url} alt={fav.film_title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FilmIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="editorial-label text-muted-foreground mb-1">— Film</p>
        <h3 className="font-display text-2xl text-foreground tracking-tight leading-tight group-hover:underline underline-offset-4">
          {fav.film_title}
          {fav.film_year ? <span className="text-muted-foreground font-normal"> · {fav.film_year}</span> : null}
        </h3>
      </div>
    </Link>
  );
}

export default function Favorites() {
  const { user, favorites, isLoading } = useFavorites();
  const [activeType, setActiveType] = useState<FavoriteType | "all">("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: favorites.length, article: 0, video: 0, book: 0, podcast: 0 };
    favorites.forEach((f) => { c[f.item_type] = (c[f.item_type] ?? 0) + 1; });
    return c;
  }, [favorites]);

  const filtered = activeType === "all" ? favorites : favorites.filter((f) => f.item_type === activeType);

  // Group by film
  const grouped = useMemo(() => {
    const map = new Map<string, { film: { film_tmdb_id: number | null; film_title: string | null; film_poster_url: string | null; film_year: number | null }; items: FavoriteRecord[] }>();
    filtered.forEach((f) => {
      const key = f.film_tmdb_id ? `tmdb:${f.film_tmdb_id}` : "none";
      if (!map.has(key)) {
        map.set(key, {
          film: { film_tmdb_id: f.film_tmdb_id, film_title: f.film_title, film_poster_url: f.film_poster_url, film_year: f.film_year },
          items: [],
        });
      }
      map.get(key)!.items.push(f);
    });
    return Array.from(map.values());
  }, [filtered]);

  return (
    <div className="dark min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-6 pt-24 pb-10">
        <p className="editorial-label mb-2">— Bibliothèque personnelle</p>
        <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">Mes favoris</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Tous les articles, vidéos, livres et podcasts que vous avez sauvegardés, regroupés par film.
        </p>
      </section>

      <section className="container mx-auto px-6 pb-20">
        {!user ? (
          <div className="py-20 text-center text-muted-foreground">
            Connectez-vous pour retrouver vos favoris.
          </div>
        ) : isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Chargement…</div>
        ) : favorites.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            Aucun favori pour l'instant. Cliquez sur l'icône signet sur un article, une vidéo, un livre ou un podcast.
          </div>
        ) : (
          <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)}>
            <TabsList className="bg-transparent p-0 border-b border-border rounded-none h-auto w-full justify-start gap-0 flex-wrap mb-10">
              {(Object.keys(TYPE_META) as Array<FavoriteType | "all">).map((k) => {
                const Icon = TYPE_META[k].icon;
                const count = counts[k] ?? 0;
                return (
                  <TabsTrigger
                    key={k}
                    value={k}
                    className={cn(
                      "rounded-none px-5 py-3 text-[13px] font-medium uppercase tracking-[0.15em] border-b border-transparent bg-transparent shadow-none -mb-px",
                      "data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                      "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 mr-2" />
                    {TYPE_META[k].label}
                    {count > 0 && <span className="ml-2 text-[10px] text-muted-foreground tabular-nums">{count}</span>}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={activeType} className="mt-0">
              {grouped.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">Aucun favori dans cette catégorie.</div>
              ) : (
                <div className="space-y-14">
                  {grouped.map((group, idx) => (
                    <div key={idx}>
                      <FilmHeader fav={group.film} />
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.items.map((fav) => (
                          <div key={fav.id} className="relative group">
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-sm">
                              <FavoriteButton
                                input={{
                                  itemType: fav.item_type,
                                  itemId: fav.item_id,
                                  itemData: fav.item_data,
                                }}
                              />
                            </div>
                            {renderItem(fav)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </section>
    </div>
  );
}