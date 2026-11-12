"use client";

import { useState, useEffect } from "react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { YearFilter } from "@/components/media/YearFilter";
import { Skeleton } from "@/components/ui/Skeleton";
import { MOCK_ANIME } from "@/providers/mock/data";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/providers/core/types";

const ANIME_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Supernatural",
  "Thriller",
];

export default function AnimePage() {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [items, setItems] = useState<MediaItem[]>(MOCK_ANIME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnime() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("type", "anime");
        if (activeGenre) params.set("genre", activeGenre);
        if (activeYear) params.set("year", activeYear.toString());

        const url = (activeGenre || activeYear)
          ? `/api/media/search?${params.toString()}`
          : `/api/media/popular?type=anime`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const list = data.items || [];
          if (list.length > 0) {
            setItems(list);
            return;
          }
        }
        let fallback = MOCK_ANIME;
        if (activeYear) fallback = fallback.filter((m) => m.year === activeYear);
        if (activeGenre) fallback = fallback.filter((m) => m.genres.some((g) => g.name.toLowerCase() === activeGenre.toLowerCase()));
        setItems(fallback.length > 0 ? fallback : MOCK_ANIME);
      } catch {
        let fallback = MOCK_ANIME;
        if (activeYear) fallback = fallback.filter((m) => m.year === activeYear);
        if (activeGenre) fallback = fallback.filter((m) => m.genres.some((g) => g.name.toLowerCase() === activeGenre.toLowerCase()));
        setItems(fallback.length > 0 ? fallback : MOCK_ANIME);
      } finally {
        setLoading(false);
      }
    }

    loadAnime();
  }, [activeGenre, activeYear]);

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Anime</h1>
        <p className="text-muted-foreground text-sm">Browse full anime catalog powered by AniList</p>
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
        {ANIME_GENRES.map((genre) => {
          const isActive = activeGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={cn(
                "flex items-center pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Year Filter */}
      <YearFilter selectedYear={activeYear} onSelectYear={setActiveYear} />

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
        <MediaGrid items={items} />
      )}
    </div>
  );
}
