"use client";

import { cn } from "@/lib/utils";
import type { Season } from "@/providers/core/types";

interface SeasonSelectorProps {
  seasons: Season[];
  activeSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  className?: string;
}

export function SeasonSelector({ seasons, activeSeason, onSeasonChange, className }: SeasonSelectorProps) {
  if (!seasons || seasons.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-6 border-b border-[#262626] overflow-x-auto no-scrollbar", className)}>
      {seasons.map((season) => {
        const isActive = activeSeason === season.seasonNumber;
        return (
          <button
            key={season.seasonNumber}
            onClick={() => onSeasonChange(season.seasonNumber)}
            className={cn(
              "flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
              isActive
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{season.title}</span>
            <span className={cn("text-xs font-normal", isActive ? "text-accent/80" : "text-muted-foreground")}>
              ({season.episodeCount})
            </span>
          </button>
        );
      })}
    </div>
  );
}
