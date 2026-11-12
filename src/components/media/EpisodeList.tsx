"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn, formatRuntime } from "@/lib/utils";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import type { Episode, WatchProgress } from "@/providers/core/types";

interface EpisodeCardProps {
  episode: Episode;
  progress?: WatchProgress;
  className?: string;
}

export function EpisodeCard({ episode, progress: propProgress, className }: EpisodeCardProps) {
  const { getProgress } = useWatchHistory();
  const progress = propProgress || getProgress(episode.seriesId, episode.id);

  const watchHref = progress && progress.position > 0
    ? `/watch/${episode.seriesId}?episode=${episode.id}&t=${Math.floor(progress.position)}`
    : `/watch/${episode.seriesId}?episode=${episode.id}`;

  return (
    <Link
      href={watchHref}
      className={cn(
        "group flex gap-2.5 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-surface-hover transition-all duration-200",
        progress && progress.position > 0 && "bg-white/[0.02] border border-[#00DF81]/20",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-28 sm:w-36 md:w-44 aspect-video rounded-lg overflow-hidden bg-surface-elevated">
        {episode.thumbnail ? (
          <Image
            src={episode.thumbnail}
            alt={episode.title}
            fill
            className="object-cover"
            sizes="176px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-elevated">
            <Play className="w-6 h-6 text-muted" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-[#00DF81]/30">
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            </div>
          </div>
        </div>

        {/* Progress */}
        {progress && (
          <div className="absolute bottom-0 left-0 right-0 p-1">
            <ProgressBar value={progress.percentage} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors flex items-center gap-2">
              <span className="text-muted-foreground">E{episode.episodeNumber}</span>
              <span>{episode.title}</span>
              {progress && progress.position > 0 && (
                <span className="text-[10px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                  {Math.floor(progress.position / 60)}m watched
                </span>
              )}
            </h4>
            {episode.runtime && (
              <span className="text-xs text-muted-foreground">{formatRuntime(episode.runtime)}</span>
            )}
          </div>
          {episode.rating && (
            <span className="text-xs text-[#00DF81] font-semibold flex-shrink-0">
              ★ {episode.rating.toFixed(1)}
            </span>
          )}
        </div>
        {episode.overview && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
            {episode.overview}
          </p>
        )}
      </div>
    </Link>
  );
}

interface EpisodeListProps {
  episodes: Episode[];
  className?: string;
}

export function EpisodeList({ episodes, className }: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No episodes available for this season.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {episodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </div>
  );
}
