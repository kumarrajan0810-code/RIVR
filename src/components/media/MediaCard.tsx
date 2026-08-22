"use client";

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
  className?: string;
}

export function MediaCard({ item, progress, showType, className }: MediaCardProps) {
  const href =
    item.type === MediaType.MOVIE
      ? `/movies/${item.id}`
      : item.type === MediaType.ANIME
        ? `/anime/${item.id}`
        : `/tv/${item.id}`;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex-shrink-0 w-[140px] sm:w-[160px] md:w-[175px] lg:w-[185px]",
        className
      )}
    >
      {/* Poster */}
      <div className="relative aspect-poster rounded-xl overflow-hidden bg-surface-elevated mb-2">
        {item.poster ? (
          <Image
            src={item.poster}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 150px, 185px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Play className="w-8 h-8" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-2xl shadow-[#00DF81]/40">
              <Play className="w-5 h-5 text-black fill-black ml-0.5" />
            </div>
          </div>
        </div>

        {/* Rating badge */}
        {item.rating && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <RatingBadge rating={item.rating} />
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

        {/* Progress */}
        {progress && (
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <ProgressBar value={progress.percentage} />
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
        {item.title}
      </h3>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
        {item.year && <span>{item.year}</span>}
        {item.year && item.genres.length > 0 && <span>•</span>}
        {item.genres[0] && <span>{item.genres[0].name}</span>}
      </div>
    </Link>
  );
}
