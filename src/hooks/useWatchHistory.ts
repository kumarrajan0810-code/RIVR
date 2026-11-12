"use client";

import { useCallback } from "react";
import type { WatchProgress, MediaItem } from "@/providers/core/types";
import { useHistoryStore } from "@/stores/historyStore";

export function useWatchHistory() {
  const { items, saveProgress, removeProgress, clearHistory, getProgress, getResumeUrl } = useHistoryStore();

  const recordProgress = useCallback(
    (media: MediaItem, progress: WatchProgress) => {
      saveProgress(media, progress);
    },
    [saveProgress]
  );

  return {
    history: items.map((i) => i.progress),
    continueWatchingItems: items,
    getProgress,
    getResumeUrl,
    recordProgress,
    removeProgress,
    clearHistory,
  };
}
