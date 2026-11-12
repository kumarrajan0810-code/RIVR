"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Play, Trash2, Clock } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/common/EmptyState";
import { useHistoryStore } from "@/stores/historyStore";
import { MediaType } from "@/providers/core/types";

export default function ContinueWatchingPage() {
  const { items: continueWatching, removeProgress, clearHistory } = useHistoryStore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Continue Watching</h1>
          <p className="text-muted-foreground text-sm">Pick up right where you left off at the exact episode and timestamp</p>
        </div>
        {hasMounted && continueWatching.length > 0 && (
          <button
            onClick={() => clearHistory()}
            className="text-xs text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818] border border-white/5 hover:border-red-500/30 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {hasMounted && continueWatching.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {continueWatching.map((item) => {
            const progress = item.progress;
            const episodeLabel = progress?.seasonNumber && progress?.episodeNumber
              ? `Season ${progress.seasonNumber}, Episode ${progress.episodeNumber}`
              : progress?.episodeNumber
                ? `Episode ${progress.episodeNumber}`
                : item.type === MediaType.MOVIE
                  ? "Movie"
                  : null;

            const resumeUrl = `/watch/${item.id}?${progress.episodeId ? `episode=${encodeURIComponent(progress.episodeId)}&` : ""}t=${Math.floor(progress.position || 0)}`;

            const detailHref =
              item.type === MediaType.MOVIE
                ? `/movies/${item.id}`
                : item.type === MediaType.ANIME
                  ? `/anime/${item.id}`
                  : `/tv/${item.id}`;

            const posMins = Math.floor((progress.position || 0) / 60);
            const durMins = Math.floor((progress.duration || (item.runtime ? item.runtime * 60 : 3600)) / 60);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-xl overflow-hidden bg-surface-elevated border border-white/10 hover:border-accent/40 transition-all duration-300"
              >
                {/* Backdrop / Poster Image */}
                <Link href={resumeUrl} className="relative aspect-video w-full overflow-hidden bg-black block">
                  {item.backdrop || item.poster ? (
                    <Image
                      src={item.backdrop || item.poster || ""}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <Play className="w-10 h-10" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    </div>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/75 text-white/90 backdrop-blur-md">
                      {item.type === MediaType.ANIME ? "Anime" : item.type === MediaType.SERIES ? "TV Show" : "Movie"}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeProgress(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 text-muted-foreground hover:text-red-400 hover:bg-black/90 transition-all cursor-pointer backdrop-blur-md opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Progress bar at bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                    <ProgressBar value={progress.percentage} />
                  </div>
                </Link>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    {episodeLabel && (
                      <p className="text-xs text-zinc-300 font-medium mt-0.5 line-clamp-1">
                        {episodeLabel}
                        {progress.episodeTitle && progress.episodeTitle !== episodeLabel ? ` — ${progress.episodeTitle}` : ""}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>{posMins}m / {durMins}m</span>
                      <span>•</span>
                      <span>{Math.round(progress.percentage)}% watched</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <Link
                      href={resumeUrl}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-white text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-white/90 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Resume</span>
                    </Link>
                    <Link
                      href={detailHref}
                      className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<PlayCircle className="w-8 h-8 text-accent" />}
          title="Nothing to continue"
          description="Start watching any movie, series, or anime and your progress will automatically sync here in real time."
        />
      )}
    </div>
  );
}
