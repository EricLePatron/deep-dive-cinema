import { Headphones, Play, ExternalLink, Radio } from "lucide-react";
import { PodcastEpisode, formatPodcastDate } from "@/services/podcast";
import { cn } from "@/lib/utils";

interface PodcastCardProps {
  episode: PodcastEpisode;
  variant?: 'default' | 'compact';
}

export function PodcastCard({ episode, variant = 'default' }: PodcastCardProps) {
  const isCompact = variant === 'compact';

  return (
    <a
      href={episode.episodeUrl || episode.audioUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block rounded-xl overflow-hidden transition-all duration-300",
        "bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-primary/30",
        "hover:shadow-lg hover:shadow-primary/5",
        isCompact ? "p-3" : "p-4"
      )}
    >
      <div className={cn("flex gap-4", isCompact ? "items-center" : "items-start")}>
        {/* Thumbnail */}
        <div className={cn(
          "relative flex-shrink-0 rounded-lg overflow-hidden bg-muted",
          isCompact ? "w-16 h-16" : "w-20 h-20"
        )}>
          {episode.thumbnailUrl ? (
            <img
              src={episode.thumbnailUrl}
              alt={episode.podcastName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Headphones className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
          
          {/* Radio France badge */}
          {episode.isRadioFrance && (
            <div className="absolute top-1 left-1 bg-primary/90 rounded px-1.5 py-0.5 flex items-center gap-1">
              <Radio className="h-2.5 w-2.5 text-primary-foreground" />
              <span className="text-[9px] font-medium text-primary-foreground">RF</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors",
            isCompact ? "text-sm" : "text-base"
          )}>
            {episode.title}
          </h3>
          
          <p className={cn(
            "text-muted-foreground mt-1",
            isCompact ? "text-xs" : "text-sm"
          )}>
            {episode.podcastName}
          </p>
          
          {!isCompact && episode.description && (
            <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">
              {episode.description}
            </p>
          )}

          {/* Meta info */}
          <div className={cn(
            "flex items-center gap-3 text-muted-foreground",
            isCompact ? "mt-1 text-xs" : "mt-2 text-xs"
          )}>
            {episode.durationFormatted && (
              <span className="flex items-center gap-1">
                <Headphones className="h-3 w-3" />
                {episode.durationFormatted}
              </span>
            )}
            {episode.publishedAt && (
              <span>{formatPodcastDate(episode.publishedAt)}</span>
            )}
          </div>
        </div>

        {/* External link icon */}
        <ExternalLink className={cn(
          "flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
          isCompact ? "h-4 w-4" : "h-5 w-5"
        )} />
      </div>
    </a>
  );
}
