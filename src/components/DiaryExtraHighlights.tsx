import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Headphones, FileText, Loader2, ArrowRight, ExternalLink, Radio } from "lucide-react";
import { searchFilmPodcasts, formatPodcastDate, PodcastEpisode } from "@/services/podcast";
import { supabase } from "@/integrations/supabase/client";
import { FilmArticle } from "@/hooks/useFilmArticles";

interface DiaryFilm {
  id: number;
  title: string;
  year: number;
  posterUrl: string | null;
  director?: string;
}

interface PodcastPick { film: DiaryFilm; episode: PodcastEpisode }
interface ArticlePick { film: DiaryFilm; article: FilmArticle }

export function DiaryExtraHighlights({ films }: { films: DiaryFilm[] }) {
  const top = films.slice(0, 3);
  const keys = top.map((f) => f.id);

  const { data: podcasts, isLoading: loadingPods } = useQuery({
    queryKey: ["diary-podcast-picks", keys],
    queryFn: async (): Promise<PodcastPick[]> => {
      const results = await Promise.all(
        top.map(async (film) => {
          try {
            const eps = await searchFilmPodcasts(film.title, film.director, 5);
            return eps[0] ? { film, episode: eps[0] } : null;
          } catch {
            return null;
          }
        }),
      );
      return results.filter(Boolean) as PodcastPick[];
    },
    enabled: top.length > 0,
    staleTime: 1000 * 60 * 30,
  });

  const { data: articles, isLoading: loadingArts } = useQuery({
    queryKey: ["diary-article-picks", keys],
    queryFn: async (): Promise<ArticlePick[]> => {
      const results = await Promise.all(
        top.map(async (film) => {
          try {
            const { data, error } = await supabase.functions.invoke("article-search", {
              body: { filmTitle: film.title, filmYear: film.year, director: film.director },
            });
            if (error || !data?.success) return null;
            const arts = (data.articles || []) as FilmArticle[];
            return arts[0] ? { film, article: arts[0] } : null;
          } catch {
            return null;
          }
        }),
      );
      return results.filter(Boolean) as ArticlePick[];
    },
    enabled: top.length > 0,
    staleTime: 1000 * 60 * 60,
  });

  const hasAny =
    (podcasts && podcasts.length > 0) ||
    (articles && articles.length > 0) ||
    loadingPods ||
    loadingArts;
  if (!hasAny) return null;

  return (
    <>
      <Section
        kicker="— À écouter"
        title="Podcasts sur vos films"
        subtitle="Une sélection sonore autour des films que vous venez de voir."
        icon={<Headphones className="h-5 w-5" />}
        loading={loadingPods}
        empty={!podcasts?.length}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {podcasts?.map(({ film, episode }) => (
            <PodcastPickCard key={film.id + episode.id} film={film} episode={episode} />
          ))}
        </div>
      </Section>

      <Section
        kicker="— À lire"
        title="Articles sur vos films"
        subtitle="Critiques et essais issus de sources cinéphiles, sur vos films récents."
        icon={<FileText className="h-5 w-5" />}
        loading={loadingArts}
        empty={!articles?.length}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {articles?.map(({ film, article }) => (
            <ArticlePickCard key={film.id + article.id} film={film} article={article} />
          ))}
        </div>
      </Section>
    </>
  );
}

function Section({
  kicker, title, subtitle, icon, loading, empty, children,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  if (!loading && empty) return null;
  return (
    <section className="relative py-8 md:py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex items-start gap-3 mb-5 md:mb-8">
          <div className="mt-1 text-foreground/70">{icon}</div>
          <div>
            <div className="editorial-label mb-1">{kicker}</div>
            <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground font-light mt-1">{subtitle}</p>}
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function FilmContext({ film }: { film: DiaryFilm }) {
  return (
    <Link to={`/film/${film.id}`} className="flex items-center gap-2.5 mb-3 group/film">
      {film.posterUrl && (
        <img src={film.posterUrl} alt={film.title} className="w-8 h-12 rounded-sm object-cover flex-shrink-0" />
      )}
      <div className="min-w-0">
        <p className="editorial-label text-foreground/60">Deep dive</p>
        <p className="text-sm font-medium text-foreground truncate group-hover/film:opacity-80 transition-opacity">
          {film.title}
          {film.year > 0 && <span className="text-muted-foreground font-normal"> ({film.year})</span>}
        </p>
      </div>
    </Link>
  );
}

function PodcastPickCard({ film, episode }: { film: DiaryFilm; episode: PodcastEpisode }) {
  return (
    <div className="border border-border rounded-sm p-4 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
      <FilmContext film={film} />
      <a
        href={episode.episodeUrl || episode.audioUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-3 group"
      >
        <div className="relative w-16 h-16 rounded-sm overflow-hidden bg-muted flex-shrink-0">
          {episode.thumbnailUrl ? (
            <img src={episode.thumbnailUrl} alt={episode.podcastName} className="w-full h-full object-cover" />
          ) : (
            <Headphones className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            {episode.isRadioFrance && <Radio className="h-3 w-3 text-primary" />}
            <span className="truncate">{episode.podcastName}</span>
          </div>
          <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:opacity-80 transition-opacity">
            {episode.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {episode.durationFormatted}
            {episode.publishedAt && ` · ${formatPodcastDate(episode.publishedAt)}`}
          </p>
        </div>
      </a>
    </div>
  );
}

function ArticlePickCard({ film, article }: { film: DiaryFilm; article: FilmArticle }) {
  return (
    <div className="border border-border rounded-sm p-4 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
      <FilmContext film={film} />
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
          <FileText className="h-3 w-3" />
          <span className="truncate">{article.source}</span>
          <span className="text-border">·</span>
          <span className="uppercase tracking-wider">{article.sourceLang}</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:opacity-80 transition-opacity">
          {article.title}
        </h4>
        {article.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 font-light">
            {article.description}
          </p>
        )}
      </a>
    </div>
  );
}
