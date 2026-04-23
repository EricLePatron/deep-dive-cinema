import { Play, Eye } from "lucide-react";
import { YouTubeVideo } from "@/services/youtube";
import { cn } from "@/lib/utils";

interface YouTubeVideoCardProps {
  video: YouTubeVideo;
  variant?: "default" | "compact";
}

function formatViewCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays}j`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mois`;
  return `${Math.floor(diffDays / 365)}ans`;
}

export function YouTubeVideoCard({ video, variant = "default" }: YouTubeVideoCardProps) {
  const isCompact = variant === "compact";

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block pt-4 border-t border-border/60 transition-opacity hover:opacity-90"
    >
      {!isCompact && (
        <div className="relative aspect-video overflow-hidden rounded-sm bg-muted mb-3">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-5 w-5 text-foreground fill-foreground ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-background/85 backdrop-blur-sm rounded-sm text-[10px] text-foreground tabular-nums font-medium">
            {video.duration}
          </div>
        </div>
      )}

      <div className={cn("flex gap-3", isCompact && "items-start")}>
        {isCompact && (
          <div className="flex-shrink-0 w-9 h-9 rounded-sm border border-border flex items-center justify-center">
            <Play className="h-4 w-4 text-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-medium text-foreground leading-snug line-clamp-2",
              isCompact ? "text-sm" : "text-[15px]"
            )}
          >
            {video.title}
          </h4>

          <p className="editorial-label mt-2 truncate">
            {video.channelTitle}
          </p>

          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground tabular-nums">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViewCount(video.viewCount)}
            </span>
            <span className="text-border">·</span>
            <span>{formatDate(video.publishedAt)}</span>
            {isCompact && (
              <>
                <span className="text-border">·</span>
                <span>{video.duration}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
