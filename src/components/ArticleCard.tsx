import { ArrowUpRight, FileText, Archive, Download } from "lucide-react";
import { FilmArticle } from "@/hooks/useFilmArticles";

export function ArticleCard({
  article,
  variant = "default",
}: {
  article: FilmArticle;
  variant?: "default" | "featured";
}) {
  const isArchive = article.sourceFormat === "archive";
  const isPdf = article.sourceFormat === "dossier-pdf";
  const Icon = isArchive ? Archive : isPdf ? Download : FileText;
  const formatLabel = isArchive
    ? "Archive"
    : isPdf
      ? "Dossier PDF"
      : article.sourceTier === 1
        ? "Critique"
        : "Presse";

  if (variant === "featured") {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block bg-gradient-to-br from-foreground/[0.04] to-transparent border border-border hover:border-foreground/50 transition-all duration-300 p-8 md:p-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-start justify-between gap-6 mb-5">
          <div className="editorial-label flex items-center gap-2 text-foreground">
            <Icon className="h-3 w-3" />
            <span>{article.source}</span>
            <span className="text-border">·</span>
            <span>{formatLabel}</span>
            <span className="text-border">·</span>
            <span>{article.sourceLang.toUpperCase()}</span>
          </div>
          <div className="editorial-label opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-foreground">
            Lire
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
        <h3 className="font-display text-3xl md:text-4xl text-foreground leading-[1.1] tracking-tight mb-4 group-hover:opacity-80 transition-opacity">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-base text-muted-foreground font-light leading-relaxed line-clamp-3 max-w-2xl">
            {article.description}
          </p>
        )}
      </a>
    );
  }

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col h-full border border-border/60 hover:border-foreground/50 hover:bg-foreground/[0.02] transition-all duration-200 p-6 bg-background"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="editorial-label flex items-center gap-2 text-foreground">
          <Icon className="h-3 w-3" />
          <span>{article.source}</span>
        </div>
        <span className="editorial-label text-muted-foreground/70">
          {formatLabel} · {article.sourceLang.toUpperCase()}
        </span>
      </div>
      <h3 className="font-display text-xl text-foreground leading-snug tracking-tight mb-3 line-clamp-3">
        {article.title}
      </h3>
      {article.description && (
        <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-3 mb-5 flex-1">
          {article.description}
        </p>
      )}
      <div className="editorial-label flex items-center gap-1.5 text-foreground/60 group-hover:text-foreground transition-colors mt-auto">
        Lire l'article
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  );
}