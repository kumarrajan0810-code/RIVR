"use client";

import { useState, useMemo } from "react";
import { Film, Tv, Sparkles, Heart } from "lucide-react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/watchlistStore";
import { MediaType } from "@/providers/core/types";

type FilterType = "all" | MediaType;

export default function MyListPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const items = useWatchlistStore((state) => state.items);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((m) => m.type === filter);
  }, [items, filter]);

  const movieCount = items.filter((w) => w.type === MediaType.MOVIE).length;
  const showCount = items.filter((w) => w.type === MediaType.SERIES).length;
  const animeCount = items.filter((w) => w.type === MediaType.ANIME).length;

  const filterButtons: { type: FilterType; label: string; icon: React.ReactNode; count: number }[] = [
    { type: "all", label: "All", icon: null, count: items.length },
    { type: MediaType.MOVIE, label: "Movies", icon: <Film className="w-4 h-4" />, count: movieCount },
    { type: MediaType.SERIES, label: "TV Shows", icon: <Tv className="w-4 h-4" />, count: showCount },
    { type: MediaType.ANIME, label: "Anime", icon: <Sparkles className="w-4 h-4" />, count: animeCount },
  ];

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">My List</h1>
        <p className="text-muted-foreground text-sm">Your saved movies, shows, and anime</p>
      </div>

      {items.length > 0 && (
        <div className="flex items-center gap-6 border-b border-[#262626] overflow-x-auto no-scrollbar pb-0">
          {filterButtons.map((btn) => {
            const isActive = filter === btn.type;
            return (
              <button
                key={btn.type}
                onClick={() => setFilter(btn.type)}
                className={cn(
                  "flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {btn.icon}
                <span>{btn.label}</span>
                <span className={cn("text-xs font-normal", isActive ? "text-accent/80" : "text-muted-foreground")}>
                  ({btn.count})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filteredItems.length > 0 ? (
        <MediaGrid items={filteredItems} showType />
      ) : (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-accent" />}
          title={items.length === 0 ? "Your list is empty" : "No titles found in this category"}
          description="Add movies, shows, and anime to your list by clicking 'My List' to save them for later."
        />
      )}
    </div>
  );
}
