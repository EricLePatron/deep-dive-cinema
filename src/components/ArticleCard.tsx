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
        className="group relative block bg-gradient-to-br from-foreground/[0.04] to-transparent border border-border hover:border-foreground/50 transition-all duration-300 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          {article.image ? (
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden bg-muted order-1 md:order-2">
              <img
                src={article.image}
                alt={article.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent md:bg-gradient-to-r md:from-background/60 md:via-background/10 md:to-transparent" />
            </div>
          ) : null}
          <div className={`p-8 md:p-10 flex flex-col justify-center order-2 md:order-1 ${!article.image ? "md:col-span-2" : ""}`}>
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
              <p className="text-base text-muted-foreground font-light leading-relaxed line-clamp-3">
            {article.description}
          </p>
        )}
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col h-full border border-border/60 hover:border-foreground/50 hover:bg-foreground/[0.02] transition-all duration-200 bg-background overflow-hidden"
    >
      {article.image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 p-6">
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
      </div>
    </a>
  );
}