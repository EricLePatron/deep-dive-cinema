import { ExternalLink, Play, Eye, ThumbsUp } from "lucide-react";
import { YouTubeVideo } from "@/services/youtube";
import { cn } from "@/lib/utils";

interface YouTubeVideoCardProps {
  video: YouTubeVideo;
  variant?: "default" | "compact";
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  }
  if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} months ago`;
  }
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function YouTubeVideoCard({ video, variant = "default" }: YouTubeVideoCardProps) {
  const isCompact = variant === "compact";

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "content-card group block",
        isCompact ? "p-4" : "p-0 overflow-hidden"
      )}
    >
      {!isCompact && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
              <Play className="h-6 w-6 text-white fill-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white font-medium">
            {video.duration}
          </div>
        </div>
      )}

      <div className={cn("flex gap-4", !isCompact && "p-4")}>
        {isCompact && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Play className="h-5 w-5 text-red-500" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2",
                isCompact ? "text-sm" : "text-base"
              )}
            >
              {video.title}
            </h4>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>

          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {video.channelTitle}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViewCount(video.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {formatViewCount(video.likeCount)}
            </span>
            {isCompact && (
              <span className="px-1.5 py-0.5 bg-muted rounded">
                {video.duration}
              </span>
            )}
            <span>{formatDate(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
