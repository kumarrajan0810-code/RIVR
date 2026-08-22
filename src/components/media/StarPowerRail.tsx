"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronRight as ArrowIcon, Sparkles } from "lucide-react";
import type { StarPerson } from "@/app/api/media/stars/route";

export function StarPowerRail() {
  const [stars, setStars] = useState<StarPerson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadStars() {
      try {
        const res = await fetch("/api/media/stars");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.stars) {
            setStars(data.stars);
            setTimeout(checkScroll, 300);
          }
        }
      } catch (err) {
        console.error("Failed to load star power:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStars();
    return () => {
      isMounted = false;
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground">
          Star Power
        </h2>
        <Link
          href="/stars"
          className="text-sm text-muted-foreground hover:text-accent transition-colors font-medium"
        >
          See All
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative group/carousel -mx-1">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-6 z-10 w-12 flex items-center justify-center bg-gradient-to-r from-background/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[135px] sm:w-[160px] md:w-[185px] aspect-[2/3] rounded-2xl bg-[#1F1F1F] animate-pulse"
              />
            ))
          ) : (
            stars.map((star) => (
              <Link
                key={star.id}
                href={`/stars/${star.id}`}
                className="group relative flex-shrink-0 w-[135px] sm:w-[160px] md:w-[185px] aspect-[2/3] rounded-2xl overflow-hidden bg-[#161616] border border-[#262626] hover:border-[#00DF81]/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] select-none block"
              >
                {/* Photo */}
                <Image
                  src={star.image}
                  alt={star.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 150px, 185px"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                {/* Ambient Green Brand Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#00DF81]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content at Bottom */}
                <div className="absolute bottom-0 inset-x-0 p-3.5 space-y-0.5 z-10">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#B3B3B2] group-hover:text-white transition-colors">
                      {star.role}
                    </span>
                    <Sparkles className="w-2.5 h-2.5 text-[#00DF81] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-display font-bold text-base md:text-lg text-[#F2F2F2] group-hover:text-[#00DF81] leading-snug transition-colors drop-shadow-md">
                    {star.name}
                  </h3>
                  <p className="text-[11px] text-[#81807E] line-clamp-1 group-hover:text-[#B3B3B2] transition-colors">
                    {star.knownFor}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-6 z-10 w-12 flex items-center justify-center bg-gradient-to-l from-background/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        )}
      </div>
    </section>
  );
}
