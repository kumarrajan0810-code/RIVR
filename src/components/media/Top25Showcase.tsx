"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Film,
  Tv,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaType, type MediaItem } from "@/providers/core/types";

type Category = "movies" | "anime" | "dramas";
type TimeWindow = "daily" | "weekly" | "monthly" | "all-time";

interface Top25ShowcaseProps {
  className?: string;
}

function Top25Card({ item, rank }: { item: MediaItem; rank: number }) {
  const [imgSrc, setImgSrc] = useState(item.poster || "/placeholder-poster.svg");

  useEffect(() => {
    setImgSrc(item.poster || "/placeholder-poster.svg");
  }, [item.poster]);

  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;

  const href =
    item.type === MediaType.MOVIE
      ? `/movies/${item.id}`
      : item.type === MediaType.ANIME
        ? `/anime/${item.id}`
        : `/tv/${item.id}`;

  return (
    <Link
      href={href}
      className="group relative flex-shrink-0 w-[165px] sm:w-[185px] md:w-[205px] block transition-transform hover:-translate-y-1"
    >
      {/* Poster Box */}
      <div
        className={cn(
          "relative aspect-poster rounded-xl overflow-hidden bg-surface-elevated mb-2 border transition-all duration-300",
          isGold
            ? "border-amber-400/80 shadow-lg shadow-amber-500/10"
            : isSilver
              ? "border-slate-300/70 shadow-lg shadow-slate-300/10"
              : isBronze
                ? "border-amber-700/70 shadow-lg shadow-amber-700/10"
                : "border-white/10 group-hover:border-accent/40"
        )}
      >
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={item.title}
            fill
            onError={() => setImgSrc("/placeholder-poster.svg")}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 165px, 205px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Play className="w-8 h-8" />
          </div>
        )}

        {/* Rank Ribbon Badge */}
        <div
          className={cn(
            "absolute top-0 left-0 px-2.5 py-1 rounded-br-xl font-display font-black text-sm tracking-tighter backdrop-blur-md shadow-md z-10 flex items-center gap-1",
            isGold
              ? "bg-gradient-to-r from-amber-500 to-yellow-300 text-black shadow-amber-500/30"
              : isSilver
                ? "bg-gradient-to-r from-slate-200 to-slate-400 text-black shadow-slate-400/30"
                : isBronze
                  ? "bg-gradient-to-r from-amber-700 to-amber-900 text-white shadow-amber-900/30"
                  : "bg-black/85 text-zinc-200 border-r border-b border-white/15 font-bold"
          )}
        >
          {isGold && <Trophy className="w-3.5 h-3.5 text-black fill-black inline" />}
          <span>#{rank}</span>
        </div>

        {/* Rating pill */}
        {item.rating && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-200 border border-white/15">
            ★ {item.rating.toFixed(1)}
          </div>
        )}

        {/* Hover play */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
              <Play className="w-5 h-5 text-black fill-black ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
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

export function Top25Showcase({ className }: Top25ShowcaseProps) {
  const [category, setCategory] = useState<Category>("movies");
  const [window, setWindow] = useState<TimeWindow>("daily");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 400);
  };

  useEffect(() => {
    async function fetchTop25() {
      setLoading(true);
      try {
        const res = await fetch(`/api/media/top25?category=${category}&window=${window}`);
        if (res.ok) {
          const data = await res.json();
          if (data.items?.length > 0) {
            setItems(data.items);
            return;
          }
        }
      } catch (err) {
        console.error("Error loading top 25:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTop25();
  }, [category, window]);

  const windowOptions: { id: TimeWindow; label: string; icon: React.ReactNode }[] = [
    { id: "daily", label: "Daily Top 25", icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
    { id: "weekly", label: "Weekly Top 25", icon: <Calendar className="w-3.5 h-3.5 text-blue-400" /> },
    { id: "monthly", label: "Monthly Top 25", icon: <Calendar className="w-3.5 h-3.5 text-purple-400" /> },
    { id: "all-time", label: "All-Time Favorites", icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" /> },
  ];

  return (
    <section className={cn("relative group/carousel py-4", className)}>
      {/* Title & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-white">
              <Trophy className="w-5 h-5 text-white" />
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Top 25 Leaderboard
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            The most watched and highest rated content right now
          </p>
        </div>

        {/* Category & Time Window Filter Controls (Matching Floating Pill Theme) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setCategory("movies")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                category === "movies"
                  ? "bg-[#2a2a2a] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              type="button"
              onClick={() => setCategory("anime")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                category === "anime"
                  ? "bg-[#2a2a2a] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Anime</span>
            </button>
            <button
              type="button"
              onClick={() => setCategory("dramas")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                category === "dramas"
                  ? "bg-[#2a2a2a] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Dramas</span>
            </button>
          </div>

          {/* Time Window Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-[#121212] p-1 rounded-full border border-white/10">
            {windowOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setWindow(opt.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer",
                  window === opt.id
                    ? "bg-[#2a2a2a] text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rail Container */}
      <div className="relative -mx-1">
        {/* Left scroll arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-6 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-background via-background/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-7 h-7 text-white" />
          </button>
        )}

        {/* Scroll list */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar px-1 pb-4 scroll-smooth"
        >
          {loading
            ? Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-[170px] sm:w-[190px] md:w-[210px] space-y-2 animate-pulse"
                >
                  <div className="aspect-poster rounded-xl bg-surface-elevated" />
                  <div className="h-4 bg-surface-elevated rounded w-3/4" />
                  <div className="h-3 bg-surface-elevated rounded w-1/2" />
                </div>
              ))
            : items.map((item, index) => (
                <Top25Card key={`${item.id}-${index + 1}`} item={item} rank={index + 1} />
              ))}
        </div>

        {/* Right scroll arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-6 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-background via-background/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-7 h-7 text-white" />
          </button>
        )}
      </div>
    </section>
  );
}
