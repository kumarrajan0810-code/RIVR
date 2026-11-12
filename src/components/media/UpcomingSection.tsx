"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Film,
  Tv,
  Plus,
  Check,
  BellRing,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/watchlistStore";
import { MediaType, type MediaItem } from "@/providers/core/types";

type UpcomingType = "all" | "movie" | "drama" | "anime";

interface UpcomingSectionProps {
  className?: string;
}

function UpcomingCard({ item }: { item: MediaItem }) {
  const [imgSrc, setImgSrc] = useState(item.poster || "/placeholder-poster.svg");
  const { isInList, toggleItem } = useWatchlistStore();

  useEffect(() => {
    setImgSrc(item.poster || "/placeholder-poster.svg");
  }, [item.poster]);

  const inList = isInList(item.id);
  const href =
    item.type === MediaType.MOVIE
      ? `/movies/${item.id}`
      : item.type === MediaType.ANIME
        ? `/anime/${item.id}`
        : `/tv/${item.id}`;

  const releaseStr = item.releaseDate
    ? formatDate(item.releaseDate)
    : item.year
      ? `Coming in ${item.year}`
      : "Coming Soon";

  return (
    <div className="group relative flex-shrink-0 w-[165px] sm:w-[185px] md:w-[200px] block transition-transform hover:-translate-y-1">
      <Link href={href} className="block">
        {/* Poster */}
        <div className="relative aspect-poster rounded-xl overflow-hidden bg-surface-elevated mb-2 border border-white/10 group-hover:border-white/30 transition-colors">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={item.title}
              fill
              onError={() => setImgSrc("/placeholder-poster.svg")}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 165px, 200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <CalendarClock className="w-8 h-8" />
            </div>
          )}

          {/* Top Release Date Pill */}
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/85 text-zinc-200 border border-white/15 shadow-md backdrop-blur-md flex items-center gap-1">
              <BellRing className="w-3 h-3 text-zinc-300" />
              <span>{releaseStr}</span>
            </span>
          </div>

          {/* Type badge */}
          <div className="absolute bottom-2 left-2 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/70 text-white/80">
              {item.type === MediaType.ANIME ? "Anime" : item.type === MediaType.SERIES ? "Drama/TV" : "Movie"}
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
        </div>

        {/* Info */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-white transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          {item.genres[0] && <span>{item.genres[0].name}</span>}
          {item.genres[0] && <span>•</span>}
          <span className="text-zinc-300 font-medium">Soon</span>
        </div>
      </Link>

      {/* Quick Add To Watchlist Button */}
      <div className="mt-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleItem(item);
          }}
          className={cn(
            "w-full py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer border",
            inList
              ? "bg-[#2a2a2a] border-white/20 text-white font-semibold"
              : "bg-zinc-900/80 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-white/20"
          )}
        >
          {inList ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>In Wishlist</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Remind Me</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function UpcomingSection({ className }: UpcomingSectionProps) {
  const [filter, setFilter] = useState<UpcomingType>("all");
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
    async function loadUpcoming() {
      setLoading(true);
      try {
        const res = await fetch(`/api/media/upcoming?type=${filter}`);
        if (res.ok) {
          const data = await res.json();
          if (data.items?.length > 0) {
            setItems(data.items);
            return;
          }
        }
      } catch (err) {
        console.error("Error loading upcoming releases:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUpcoming();
  }, [filter]);

  const filterTabs: { id: UpcomingType; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All Upcoming", icon: <CalendarClock className="w-3.5 h-3.5" /> },
    { id: "movie", label: "Upcoming Movies", icon: <Film className="w-3.5 h-3.5" /> },
    { id: "drama", label: "Upcoming Dramas", icon: <Tv className="w-3.5 h-3.5" /> },
    { id: "anime", label: "Upcoming Anime", icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <section className={cn("relative group/carousel py-4", className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-white">
              <CalendarClock className="w-5 h-5 text-white" />
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Coming Soon & Upcoming Releases
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Anticipated movies, anime, and dramas releasing soon
          </p>
        </div>

        {/* Filter Tabs (Matching Floating Pill Theme) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-[#121212] p-1 rounded-full border border-white/10">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                filter === tab.id
                  ? "bg-[#2a2a2a] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
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
            ? Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-[165px] sm:w-[185px] md:w-[200px] space-y-2 animate-pulse"
                >
                  <div className="aspect-poster rounded-xl bg-surface-elevated" />
                  <div className="h-4 bg-surface-elevated rounded w-3/4" />
                  <div className="h-3 bg-surface-elevated rounded w-1/2" />
                </div>
              ))
            : items.map((item) => <UpcomingCard key={item.id} item={item} />)}
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
