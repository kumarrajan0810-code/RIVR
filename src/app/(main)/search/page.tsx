"use client";

import { useState, useEffect } from "react";
import { Search, X, Film, Tv, Sparkles, Loader2 } from "lucide-react";
import { MediaGrid } from "@/components/media/MediaGrid";
import { NoResultsState } from "@/components/common/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { MediaType, type MediaItem } from "@/providers/core/types";

type FilterType = "all" | MediaType;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const typeParam = filter !== "all" ? `&type=${filter}` : "";
        const res = await fetch(`/api/media/search?q=${encodeURIComponent(debouncedQuery)}${typeParam}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.items || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery, filter]);

  const filterButtons: { type: FilterType; label: string; icon: React.ReactNode }[] = [
    { type: "all", label: "All", icon: null },
    { type: MediaType.MOVIE, label: "Movies", icon: <Film className="w-4 h-4" /> },
    { type: MediaType.SERIES, label: "TV Shows", icon: <Tv className="w-4 h-4" /> },
    { type: MediaType.ANIME, label: "Anime", icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Search input */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search RIVR for movies, TV shows, and anime..."
          className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-surface-elevated border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface-hover text-muted-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Underline Filter Tabs */}
      {debouncedQuery.trim() && (
        <div className="flex items-center gap-6 border-b border-[#262626] overflow-x-auto no-scrollbar pb-0">
          {filterButtons.map((btn) => (
            <button
              key={btn.type}
              onClick={() => setFilter(btn.type)}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                filter === btn.type
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : debouncedQuery.trim() ? (
        results.length > 0 ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{debouncedQuery}&rdquo;
            </p>
            <MediaGrid items={results} showType />
          </div>
        ) : (
          <NoResultsState query={debouncedQuery} />
        )
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Search RIVR</h2>
          <p className="text-sm text-muted-foreground">Find any movie, TV show, or anime across all providers</p>
        </div>
      )}
    </div>
  );
}
