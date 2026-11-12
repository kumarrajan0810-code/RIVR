"use client";

import { useState, useEffect } from "react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { YearFilter } from "@/components/media/YearFilter";
import { Skeleton } from "@/components/ui/Skeleton";
import { MOCK_MOVIES, GENRES } from "@/providers/mock/data";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/providers/core/types";

export default function MoviesPage() {
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [movies, setMovies] = useState<MediaItem[]>(MOCK_MOVIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("type", "movie");
        if (activeGenre) params.set("genre", activeGenre);
        if (activeYear) params.set("year", activeYear.toString());

        const url = (activeGenre || activeYear)
          ? `/api/media/search?${params.toString()}`
          : `/api/media/popular?type=movie`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.items?.length > 0) {
            setMovies(data.items);
            return;
          }
        }
        // Fallback filter
        let fallback = MOCK_MOVIES;
        if (activeYear) fallback = fallback.filter((m) => m.year === activeYear);
        if (activeGenre) fallback = fallback.filter((m) => m.genres.some((g) => g.name.toLowerCase() === activeGenre.toLowerCase()));
        setMovies(fallback.length > 0 ? fallback : MOCK_MOVIES);
      } catch {
        let fallback = MOCK_MOVIES;
        if (activeYear) fallback = fallback.filter((m) => m.year === activeYear);
        if (activeGenre) fallback = fallback.filter((m) => m.genres.some((g) => g.name.toLowerCase() === activeGenre.toLowerCase()));
        setMovies(fallback.length > 0 ? fallback : MOCK_MOVIES);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, [activeGenre, activeYear]);

  const movieGenres = GENRES.filter((g) =>
    ["28", "12", "16", "35", "80", "18", "14", "27", "878", "53"].includes(g.id)
  );

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Movies</h1>
        <p className="text-muted-foreground text-sm">Discover blockbuster and classic movies</p>
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
        {movieGenres.map((genre) => {
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
        <MediaGrid items={movies} />
      )}
    </div>
  );
}
