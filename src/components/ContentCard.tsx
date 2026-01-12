import { ExternalLink, Book, Video, Headphones, FileText, Mic, Play } from "lucide-react";
import { ContentItem } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  item: ContentItem;
  variant?: "default" | "compact";
}

const typeIcons = {
  book: Book,
  documentary: Video,
  youtube: Play,
  podcast: Headphones,
  article: FileText,
  interview: Mic,
};

const typeColors = {
  book: "text-amber-500",
  documentary: "text-blue-500",
  youtube: "text-red-500",
  podcast: "text-purple-500",
  article: "text-green-500",
  interview: "text-cyan-500",
};

const typeBgColors = {
  book: "bg-amber-500/10",
  documentary: "bg-blue-500/10",
  youtube: "bg-red-500/10",
  podcast: "bg-purple-500/10",
  article: "bg-green-500/10",
  interview: "bg-cyan-500/10",
};

export function ContentCard({ item, variant = "default" }: ContentCardProps) {
  const Icon = typeIcons[item.type];
  const isCompact = variant === "compact";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "content-card group block",
        isCompact ? "p-4" : "p-5"
      )}
    >
      <div className="flex gap-4">
        {/* Image or Icon */}
        {item.imageUrl && !isCompact ? (
          <div className="w-20 h-28 rounded-md overflow-hidden flex-shrink-0 bg-muted">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex-shrink-0 rounded-lg flex items-center justify-center",
              typeBgColors[item.type],
              isCompact ? "w-10 h-10" : "w-12 h-12"
            )}
          >
            <Icon className={cn(typeColors[item.type], isCompact ? "h-5 w-5" : "h-6 w-6")} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2",
                isCompact ? "text-sm" : "text-base"
              )}
            >
              {item.title}
            </h4>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>

          {!isCompact && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className={cn("font-medium", typeColors[item.type])}>
              {item.source}
            </span>
            {item.author && <span>by {item.author}</span>}
            {item.channel && <span>{item.channel}</span>}
            {item.duration && (
              <span className="px-1.5 py-0.5 bg-muted rounded">
                {item.duration}
              </span>
            )}
            {item.date && <span>{item.date}</span>}
          </div>
        </div>
      </div>
    </a>
  );
}
