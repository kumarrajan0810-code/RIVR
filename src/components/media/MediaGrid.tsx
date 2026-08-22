"use client";

import { cn } from "@/lib/utils";
import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/providers/core/types";

interface MediaGridProps {
  items: MediaItem[];
  showType?: boolean;
  className?: string;
}

export function MediaGrid({ items, showType, className }: MediaGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5",
        className
      )}
    >
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          showType={showType}
          className="w-full"
        />
      ))}
    </div>
  );
}
