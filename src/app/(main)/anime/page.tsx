"use client";

import { useState, useEffect } from "react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { GENRES, MOCK_ANIME } from "@/providers/mock/data";
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
  const [items, setItems] = useState<MediaItem[]>(MOCK_ANIME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnime() {
      setLoading(true);
      try {
        const url = activeGenre
          ? `/api/media/search?genre=${encodeURIComponent(activeGenre)}&type=anime`
          : `/api/media/popular?type=anime`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const list = data.items || [];
          if (list.length > 0) {
            setItems(list);
          } else {
            setItems(MOCK_ANIME);
          }
        }
      } catch {
        setItems(MOCK_ANIME);
      } finally {
        setLoading(false);
      }
    }

    loadAnime();
  }, [activeGenre]);

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
