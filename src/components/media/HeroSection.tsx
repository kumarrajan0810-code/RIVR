"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Play, Plus, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, RatingBadge } from "@/components/ui/Badge";
import { cn, formatRuntime } from "@/lib/utils";
import { useWatchlistStore } from "@/stores/watchlistStore";
import type { MediaItem } from "@/providers/core/types";
import { MediaType } from "@/providers/core/types";

interface HeroSectionProps {
  items: MediaItem[];
  onAddToList?: (item: MediaItem) => void;
  isInWatchlist?: (id: string) => boolean;
}

export function HeroSection({ items, onAddToList, isInWatchlist }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toggleItem, isInList: checkInList } = useWatchlistStore();
  const item = items[activeIndex];

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((i) => (i + 1) % items.length);
        setIsTransitioning(false);
      }, 400);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!item) return null;

  const detailHref =
    item.type === MediaType.MOVIE
      ? `/movies/${item.id}`
      : item.type === MediaType.ANIME
        ? `/anime/${item.id}`
        : `/tv/${item.id}`;

  const inList = isInWatchlist ? isInWatchlist(item.id) : checkInList(item.id);
  const handleToggleList = () => {
    if (onAddToList) onAddToList(item);
    else toggleItem(item);
  };

  return (
    <section className="relative w-full h-[65vh] sm:h-[75vh] min-h-[480px] max-h-[800px]">
      {/* Backdrop */}
      <div className={cn("absolute inset-0 transition-opacity duration-500", isTransitioning ? "opacity-0" : "opacity-100")}>
        {item.backdrop ? (
          <Image
            src={item.backdrop}
            alt={item.title}
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-background" />
        )}
      </div>

      {/* Gradients */}
      <div className="hero-gradient absolute inset-0" />
      <div className="hero-gradient-bottom absolute inset-0" />

      {/* Content */}
      <div
        className={cn(
          "absolute bottom-8 sm:bottom-16 md:bottom-20 left-0 right-0 px-4 sm:px-6 md:px-12 max-w-3xl transition-all duration-500",
          isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}
      >
        {/* Title */}
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2 sm:mb-3 text-white drop-shadow-lg line-clamp-2">
          {item.title}
        </h1>

        {/* Metadata */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {item.rating && <RatingBadge rating={item.rating} />}
          {item.year && (
            <Badge variant="outline">{item.year}</Badge>
          )}
          {item.runtime && (
            <Badge variant="outline">{formatRuntime(item.runtime)}</Badge>
          )}
          {item.genres.slice(0, 3).map((genre) => (
            <Badge key={genre.id} variant="default">
              {genre.name}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm md:text-base text-gray-300 line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 max-w-2xl leading-relaxed">
          {item.overview}
        </p>

        {/* Actions */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          <Link href={`/watch/${item.id}`}>
            <Button variant="primary" size="lg" className="gap-2 font-bold text-black px-4 sm:px-6 shadow-xl shadow-white/10 text-sm sm:text-base">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black text-black" />
              Watch Now
            </Button>
          </Link>
          <button
            onClick={handleToggleList}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-[#1A1A1A]/85 hover:bg-[#262626] border border-[#333333] text-[#F2F2F2] text-sm sm:text-base font-medium transition-all backdrop-blur-md cursor-pointer shadow-lg"
          >
            {inList ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-accent" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
            {inList ? "In My List" : "My List"}
          </button>
          <Link
            href={detailHref}
            className="p-2.5 sm:p-3 rounded-lg bg-[#1A1A1A]/85 hover:bg-[#262626] border border-[#333333] text-[#F2F2F2] transition-all backdrop-blur-md shadow-lg"
            title="More Info"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
