"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Film, Star, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StarPerson } from "@/lib/stars";

export default function StarsPage() {
  const [stars, setStars] = useState<StarPerson[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "actor" | "director">("all");
  const [loading, setLoading] = useState(true);
  const [isSearching, startTransition] = useTransition();

  // Load initial stars
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/media/stars");
        if (res.ok) {
          const data = await res.json();
          if (data.stars) setStars(data.stars);
        }
      } catch (err) {
        console.error("Failed to load stars:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Search effect with debounce for live TMDB query
  useEffect(() => {
    if (!search.trim()) {
      // Reload default stars
      fetch("/api/media/stars")
        .then((r) => r.json())
        .then((data) => {
          if (data.stars) setStars(data.stars);
        })
        .catch(console.error);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/media/stars?q=${encodeURIComponent(search.trim())}`);
          if (res.ok) {
            const data = await res.json();
            if (data.stars) setStars(data.stars);
          }
        } catch (err) {
          console.error("Failed to search stars:", err);
        }
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const filtered = stars.filter((s) => {
    if (filterType === "all") return true;
    return s.type === filterType;
  });

  return (
    <div className="space-y-6 px-4 md:px-8 py-6">
      {/* Simple standard clean title matching other tabs */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">
          Star Power
        </h1>
        <p className="text-muted-foreground text-sm">
          Explore world-renowned actors, visionaries, and directors
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Underline Tabs */}
        <div className="flex items-center gap-6 border-b border-[#262626] w-full sm:w-auto overflow-x-auto pb-0 no-scrollbar">
          <button
            onClick={() => setFilterType("all")}
            className={cn(
              "flex items-center pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
              filterType === "all"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            All Icons
          </button>
          <button
            onClick={() => setFilterType("actor")}
            className={cn(
              "flex items-center gap-1.5 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
              filterType === "actor"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Star className="w-4 h-4" />
            <span>Actors</span>
          </button>
          <button
            onClick={() => setFilterType("director")}
            className={cn(
              "flex items-center gap-1.5 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
              filterType === "director"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Film className="w-4 h-4" />
            <span>Directors</span>
          </button>
        </div>

        {/* Search Input with live TMDB connection */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any actor or director..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#262626] focus:border-accent text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors"
          />
          {isSearching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-spin" />
          )}
        </div>
      </div>

      {/* Grid of Stars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-2xl bg-[#1A1A1A] animate-pulse"
              />
            ))
          : filtered.map((star) => (
              <Link
                key={star.id}
                href={`/stars/${star.id}`}
                className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#161616] border border-[#262626] hover:border-accent/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.03] select-none block"
              >
                {/* Photo */}
                <Image
                  src={star.image}
                  alt={star.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 160px, 220px"
                />

                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

                {/* Ambient Green Brand Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#00DF81]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 inset-x-0 p-3.5 space-y-1 z-10">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#B3B3B2] group-hover:text-white transition-colors">
                      {star.role}
                    </span>
                    <Sparkles className="w-2.5 h-2.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#F2F2F2] group-hover:text-accent leading-snug transition-colors line-clamp-1">
                    {star.name}
                  </h3>
                  <p className="text-[11px] text-[#81807E] line-clamp-1 group-hover:text-[#B3B3B2] transition-colors">
                    {star.knownFor}
                  </p>
                </div>
              </Link>
            ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No stars found matching &ldquo;{search}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
