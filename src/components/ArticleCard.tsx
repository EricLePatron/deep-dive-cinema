import { ExternalLink, FileText, Archive, Download } from "lucide-react";
import { FilmArticle } from "@/hooks/useFilmArticles";

export function ArticleCard({ article }: { article: FilmArticle }) {
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
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-border/60 hover:border-foreground/40 transition-colors p-5 bg-background"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="editorial-label flex items-center gap-2 text-foreground/70">
          <Icon className="h-3 w-3" />
          <span>{article.source}</span>
          <span className="text-border">·</span>
          <span>{formatLabel}</span>
          <span className="text-border">·</span>
          <span>{article.sourceLang.toUpperCase()}</span>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
      <h3 className="font-display text-lg text-foreground leading-snug mb-2 line-clamp-3 group-hover:opacity-80 transition-opacity">
        {article.title}
      </h3>
      {article.description && (
        <p className="text-sm text-muted-foreground font-light line-clamp-3">
          {article.description}
        </p>
      )}
    </a>
  );
}