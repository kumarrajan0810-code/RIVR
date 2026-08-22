"use client";

import { useState, useCallback } from "react";
import type { WatchlistItem, MediaItem } from "@/providers/core/types";
import { MOCK_WATCHLIST } from "@/providers/mock/data";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(MOCK_WATCHLIST);

  const isInWatchlist = useCallback(
    (mediaId: string) => watchlist.some((item) => item.mediaId === mediaId),
    [watchlist]
  );

  const addToWatchlist = useCallback((media: MediaItem) => {
    setWatchlist((prev) => {
      if (prev.some((item) => item.mediaId === media.id)) return prev;
      return [
        {
          id: `wl-${Date.now()}`,
          mediaId: media.id,
          media,
          addedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  }, []);

  const removeFromWatchlist = useCallback((mediaId: string) => {
    setWatchlist((prev) => prev.filter((item) => item.mediaId !== mediaId));
  }, []);

  const toggleWatchlist = useCallback(
    (media: MediaItem) => {
      if (isInWatchlist(media.id)) {
        removeFromWatchlist(media.id);
      } else {
        addToWatchlist(media);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  return {
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
  };
}
