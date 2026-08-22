"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaCard } from "./MediaCard";
import type { MediaItem, WatchProgress } from "@/providers/core/types";

interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  seeAllHref?: string;
  progressMap?: Map<string, WatchProgress>;
  showType?: boolean;
  className?: string;
}

export function MediaCarousel({
  title,
  items,
  seeAllHref,
  progressMap,
  showType,
  className,
}: MediaCarouselProps) {
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

  if (items.length === 0) return null;

  return (
    <section className={cn("relative group/carousel", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground">
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium"
          >
            See All
          </Link>
        )}
      </div>

      {/* Scroll container */}
      <div className="relative -mx-1">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-12 z-10 w-10 flex items-center justify-center bg-gradient-to-r from-background/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar px-1 pb-2 scroll-smooth"
        >
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              progress={progressMap?.get(item.id)}
              showType={showType}
            />
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-12 z-10 w-10 flex items-center justify-center bg-gradient-to-l from-background/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        )}
      </div>
    </section>
  );
}
