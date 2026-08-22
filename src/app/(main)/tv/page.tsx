"use client";

import { useState, useEffect } from "react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { MOCK_SERIES, GENRES } from "@/providers/mock/data";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/providers/core/types";

export default function TVShowsPage() {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [series, setSeries] = useState<MediaItem[]>(MOCK_SERIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadTV() {
      setLoading(true);
      try {
        const url = activeGenre
          ? `/api/media/search?genre=${encodeURIComponent(activeGenre)}&type=series`
          : `/api/media/popular?type=series`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.items?.length > 0) {
            setSeries(data.items);
          } else {
            setSeries(MOCK_SERIES);
          }
        }
      } catch {
        setSeries(MOCK_SERIES);
      } finally {
        setLoading(false);
      }
    }

    loadTV();
  }, [activeGenre]);

  const tvGenres = GENRES.filter((g) =>
    ["18", "80", "10765", "9648", "35", "10759", "16", "99"].includes(g.id)
  );

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">TV Shows</h1>
        <p className="text-muted-foreground text-sm">Binge trending series and acclaimed shows</p>
      </div>

      {/* Genre filter tabs */}
      <div className="flex items-center gap-6 border-b border-[#262626] overflow-x-auto no-scrollbar pb-0">
        <button
          onClick={() => setActiveGenre(null)}
          className={cn(
            "flex items-center pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            !activeGenre
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {tvGenres.map((genre) => {
          const isActive = activeGenre === genre.name;
          return (
            <button
              key={genre.id}
              onClick={() => setActiveGenre(genre.name)}
              className={cn(
                "flex items-center pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-5">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-poster w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <MediaGrid items={series} />
      )}
    </div>
  );
}
