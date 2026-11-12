"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/providers/core/types";
import { MediaType } from "@/providers/core/types";

interface NetworkOption {
  id: string;
  name: string;
  tagline: string;
  renderBadge: (isSelected: boolean) => React.ReactNode;
}

const NETWORKS: NetworkOption[] = [
  {
    id: "netflix",
    name: "Netflix",
    tagline: "Popular titles on this streaming service",
    renderBadge: (isSelected) => (
      <span className={cn("font-extrabold tracking-widest text-sm uppercase font-sans transition-opacity", isSelected ? "text-white opacity-100" : "text-white/70 group-hover:text-white")}>
        NETFLIX
      </span>
    ),
  },
  {
    id: "prime",
    name: "Prime Video",
    tagline: "Amazon Originals and hit blockbusters",
    renderBadge: (isSelected) => (
      <span className={cn("font-bold text-xs tracking-tight transition-opacity", isSelected ? "text-white opacity-100" : "text-white/70 group-hover:text-white")}>
        prime video
      </span>
    ),
  },
  {
    id: "hbo",
    name: "HBO Max",
    tagline: "Prestige HBO dramas and Warner Bros hits",
    renderBadge: (isSelected) => (
      <span className={cn("font-black text-xs tracking-tight transition-opacity", isSelected ? "text-white opacity-100" : "text-white/70 group-hover:text-white")}>
        HBOMax
      </span>
    ),
  },
  {
    id: "disney",
    name: "Disney+",
    tagline: "Marvel, Star Wars, Pixar & Disney Classics",
    renderBadge: (isSelected) => (
      <span className={cn("font-bold text-xs tracking-wider transition-opacity", isSelected ? "text-white opacity-100" : "text-white/70 group-hover:text-white")}>
        Disney+
      </span>
    ),
  },
  {
    id: "apple",
    name: "Apple TV+",
    tagline: "Award-winning Apple Original series and films",
    renderBadge: (isSelected) => (
      <span className={cn("font-semibold text-xs tracking-tight transition-opacity", isSelected ? "text-white opacity-100" : "text-white/70 group-hover:text-white")}>
        tv+
      </span>
    ),
  },
  {
    id: "paramount",
    name: "Paramount+",
    tagline: "Live action, Star Trek & Paramount blockbusters",
    renderBadge: (isSelected) => (
      <span className={cn("font-bold italic text-xs tracking-tighter transition-opacity", isSelected ? "text-white opacity-100" : "text-white/70 group-hover:text-white")}>
        Paramount+
      </span>
    ),
  },
  {
    id: "hulu",
    name: "Hulu",
    tagline: "FX series, documentaries and TV hits",
    renderBadge: (isSelected) => (
      <span className={cn("font-black text-sm tracking-tighter lowercase transition-opacity", isSelected ? "text-white opacity-100" : "text-white/70 group-hover:text-white")}>
        hulu
      </span>
    ),
  },
];

export function StreamingNetworkRail() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption>(NETWORKS[0]);
  const [items, setItems] = useState<MediaItem[]>([]);
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
    setLoading(true);

    async function loadNetworkMedia() {
      try {
        const res = await fetch(`/api/media/networks?network=${selectedNetwork.id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.items?.length > 0) {
            setItems(data.items);
            setTimeout(checkScroll, 300);
          }
        }
      } catch (err) {
        console.error("Failed to load network media:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadNetworkMedia();
    return () => {
      isMounted = false;
    };
  }, [selectedNetwork]);

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
      <div>
        <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground">
          Only on Streaming Providers
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {selectedNetwork.tagline}
        </p>
      </div>

      {/* Network Tabs (Clean white labels, no strokes) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
        {NETWORKS.map((network) => {
          const isSelected = selectedNetwork.id === network.id;
          return (
            <button
              key={network.id}
              onClick={() => setSelectedNetwork(network)}
              className={cn(
                "group flex-shrink-0 h-11 min-w-[105px] md:min-w-[125px] px-4 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer",
                isSelected
                  ? "bg-[#262626] text-white shadow-md shadow-black/30"
                  : "bg-[#141414] hover:bg-[#1F1F1F]"
              )}
            >
              {network.renderBadge(isSelected)}
            </button>
          );
        })}
      </div>

      {/* Media Carousel */}
      <div className="relative group/carousel -mx-1">
        {/* Scroll Left */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-8 z-10 w-12 flex items-center justify-center bg-gradient-to-r from-background/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}

        {/* Items Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-1 py-2"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[210px] sm:w-[250px] md:w-[280px] space-y-2.5 animate-pulse"
              >
                <div className="aspect-video rounded-xl bg-[#1F1F1F]" />
                <div className="h-4 bg-[#1F1F1F] rounded w-3/4" />
                <div className="h-3 bg-[#1F1F1F] rounded w-1/2" />
              </div>
            ))
          ) : (
            items.map((item) => {
              const href =
                item.type === MediaType.MOVIE
                  ? `/movies/${item.id}`
                  : item.type === MediaType.ANIME
                  ? `/anime/${item.id}`
                  : `/tv/${item.id}`;

              const imageSrc = item.backdrop || item.poster;

              return (
                <Link
                  key={item.id}
                  href={href}
                  className="group flex-shrink-0 w-[210px] sm:w-[250px] md:w-[280px] select-none"
                >
                  {/* Backdrop Card (16:9) */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#262626] group-hover:border-[#404040] transition-all duration-300 mb-2 shadow-lg group-hover:shadow-2xl">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 240px, 280px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A] text-muted">
                        <Play className="w-8 h-8" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Play Hover Bubble */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                      <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                        <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <h3 className="text-sm font-semibold text-[#F2F2F2] line-clamp-1 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#81807E] mt-0.5 font-medium">
                    {item.rating ? (
                      <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                        <Star className="w-3 h-3 fill-current" />
                        {item.rating.toFixed(1)}
                      </span>
                    ) : null}
                    {item.year && <span>• {item.year}</span>}
                    <span>
                      • {item.type === MediaType.MOVIE ? "Movie" : "TV Show"}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Scroll Right */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-8 z-10 w-12 flex items-center justify-center bg-gradient-to-l from-background/90 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        )}
      </div>
    </section>
  );
}
