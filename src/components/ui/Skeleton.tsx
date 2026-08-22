"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-elevated rounded-lg animate-pulse",
        className
      )}
    />
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[160px] md:w-[185px]">
      <Skeleton className="aspect-poster w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4 mt-2" />
      <Skeleton className="h-3 w-1/2 mt-1" />
    </div>
  );
}

export function EpisodeCardSkeleton() {
  return (
    <div className="flex gap-4 p-3">
      <Skeleton className="w-40 aspect-video rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px]">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute bottom-20 left-12 space-y-4">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-4 w-[600px]" />
        <Skeleton className="h-4 w-[500px]" />
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-12 w-36 rounded-lg" />
          <Skeleton className="h-12 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
