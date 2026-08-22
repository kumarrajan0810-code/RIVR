"use client";

import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { EmptyState } from "@/components/common/EmptyState";
import { useHistoryStore } from "@/stores/historyStore";
import type { WatchProgress } from "@/providers/core/types";

export default function ContinueWatchingPage() {
  const continueWatching = useHistoryStore((state) => state.items);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const progressMap = new Map<string, WatchProgress>();
  continueWatching.forEach((item) => {
    progressMap.set(item.id, item.progress);
  });

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Continue Watching</h1>
        <p className="text-muted-foreground text-sm">Pick up where you left off</p>
      </div>

      {hasMounted && continueWatching.length > 0 ? (
        <MediaCarousel
          title=""
          items={continueWatching}
          progressMap={progressMap}
          showType
        />
      ) : (
        <EmptyState
          icon={<PlayCircle className="w-8 h-8 text-accent" />}
          title="Nothing to continue"
          description="Start watching any movie, series, or anime and your progress will automatically sync here in real time."
        />
      )}
    </div>
  );
}
