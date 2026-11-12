"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { RatingBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import type { MediaItem, WatchProgress } from "@/providers/core/types";
import { MediaType } from "@/providers/core/types";

interface MediaCardProps {
  item: MediaItem;
  progress?: WatchProgress;
  showType?: boolean;
  directResume?: boolean;
  className?: string;
}

export function MediaCard({ item, progress, showType, directResume = true, className }: MediaCardProps) {
  const [imgSrc, setImgSrc] = useState(item.poster || "/placeholder-poster.svg");

  useEffect(() => {
    setImgSrc(item.poster || "/placeholder-poster.svg");
  }, [item.poster]);

  const detailHref =
    item.type === MediaType.MOVIE
      ? `/movies/${item.id}`
      : item.type === MediaType.ANIME
        ? `/anime/${item.id}`
        : `/tv/${item.id}`;

  const watchHref = progress
    ? `/watch/${item.id}?${progress.episodeId ? `episode=${encodeURIComponent(progress.episodeId)}&` : ""}t=${Math.floor(progress.position || 0)}`
    : detailHref;

  const targetHref = (progress && directResume) ? watchHref : detailHref;

  const episodeLabel = progress?.seasonNumber && progress?.episodeNumber
    ? `S${progress.seasonNumber}:E${progress.episodeNumber}`
    : progress?.episodeNumber
      ? `Ep ${progress.episodeNumber}`
      : null;

  return (
    <div
      className={cn(
        "group relative flex-shrink-0 w-[140px] sm:w-[160px] md:w-[175px] lg:w-[185px]",
        className
      )}
    >
      <Link href={targetHref} className="block">
        {/* Poster */}
        <div className="relative aspect-poster rounded-xl overflow-hidden bg-surface-elevated mb-2">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={item.title}
              fill
              onError={() => setImgSrc("/placeholder-poster.svg")}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 150px, 185px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Play className="w-8 h-8" />
            </div>
          )}

          {/* Hover overlay with Quick Resume Play icon */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col items-center justify-center gap-1.5">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-2xl shadow-[#00DF81]/40">
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              </div>
            </div>
            {progress && (
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] font-bold text-accent uppercase tracking-wider bg-black/80 px-2 py-0.5 rounded-full border border-accent/30">
                Resume
              </span>
            )}
          </div>

          {/* Rating badge */}
          {item.rating && !progress && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <RatingBadge rating={item.rating} />
            </div>
          )}

          {/* Episode in progress pill */}
          {episodeLabel && (
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-accent border border-accent/30 shadow-md">
                {episodeLabel}
              </span>
            </div>
          )}

          {/* Type badge */}
          {showType && (
            <div className="absolute top-2 left-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 text-white/80">
                {item.type === MediaType.ANIME ? "Anime" : item.type === MediaType.SERIES ? "TV" : "Movie"}
              </span>
            </div>
          )}

          {/* Progress bar */}
          {progress && (
            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
              <ProgressBar value={progress.percentage} />
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          {progress ? (
            <span className="text-accent font-medium">
              {episodeLabel ? `${episodeLabel} • ` : ""}{Math.floor((progress.position || 0) / 60)}m watched
            </span>
          ) : (
            <>
              {item.year && <span>{item.year}</span>}
              {item.year && item.genres.length > 0 && <span>•</span>}
              {item.genres[0] && <span>{item.genres[0].name}</span>}
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
