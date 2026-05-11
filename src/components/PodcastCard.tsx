import { Headphones, Play, Radio } from "lucide-react";
import { PodcastEpisode, formatPodcastDate } from "@/services/podcast";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ConsumedButton } from "@/components/ConsumedButton";
import { useConsumed } from "@/hooks/useConsumed";

interface PodcastCardProps {
  episode: PodcastEpisode;
  variant?: 'default' | 'compact';
  film?: { tmdbId?: number; title?: string; posterUrl?: string | null; year?: number };
}

export function PodcastCard({ episode, variant = 'default', film }: PodcastCardProps) {
  const isCompact = variant === 'compact';
  const { isConsumed } = useConsumed();
  const consumed = isConsumed("podcast", episode.id);

  return (
    <div className={cn("relative group transition-opacity", consumed && "opacity-60 hover:opacity-90")}>
      <div className="absolute top-2 right-0 z-10 flex items-center gap-1">
        <ConsumedButton input={{ itemType: "podcast", itemId: episode.id, itemData: episode, film }} />
        <FavoriteButton input={{ itemType: "podcast", itemId: episode.id, itemData: episode, film }} />
      </div>
      <a
      href={episode.episodeUrl || episode.audioUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block pt-4 border-t border-border/60 transition-opacity hover:opacity-90"
    >
      <div className={cn("flex gap-4", isCompact ? "items-start" : "items-start")}>
        {/* Thumbnail */}
        <div className={cn(
          "relative flex-shrink-0 rounded-sm overflow-hidden bg-muted",
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

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
            <Play className="h-5 w-5 text-foreground fill-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {episode.isRadioFrance && (
            <div className="absolute top-1 left-1 bg-background/90 rounded-sm px-1 py-0.5 flex items-center gap-0.5">
              <Radio className="h-2 w-2 text-foreground" />
              <span className="text-[8px] font-medium text-foreground tracking-wider">RF</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="editorial-label mb-1.5 truncate">
            {episode.podcastName}
          </div>
          <h3 className={cn(
            "font-medium text-foreground leading-snug line-clamp-2",
            isCompact ? "text-sm" : "text-[15px]"
          )}>
            {episode.title}
          </h3>

          {!isCompact && episode.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {episode.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground tabular-nums">
            {episode.durationFormatted && (
              <span className="flex items-center gap-1">
                <Headphones className="h-3 w-3" />
                {episode.durationFormatted}
              </span>
            )}
            {episode.durationFormatted && episode.publishedAt && <span className="text-border">·</span>}
            {episode.publishedAt && (
              <span>{formatPodcastDate(episode.publishedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </a>
    </div>
  );
}
