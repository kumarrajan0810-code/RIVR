"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaItem, WatchProgress } from "@/providers/core/types";

export interface ContinueWatchingItem extends MediaItem {
  progress: WatchProgress;
}

interface HistoryState {
  items: ContinueWatchingItem[];
  saveProgress: (media: MediaItem, progress: WatchProgress) => void;
  removeProgress: (mediaId: string) => void;
  clearHistory: () => void;
  getProgress: (mediaId: string, episodeId?: string) => WatchProgress | undefined;
  getResumeUrl: (item: ContinueWatchingItem | { id: string; progress?: WatchProgress }) => string;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      saveProgress: (media, progress) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== media.id);
          // Don't keep completed items (> 95%) in continue watching
          if (progress.percentage >= 95) {
            return { items: filtered };
          }
          const updatedItem: ContinueWatchingItem = {
            ...media,
            progress,
          };
          return { items: [updatedItem, ...filtered].slice(0, 25) };
        }),
      removeProgress: (mediaId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== mediaId),
        })),
      clearHistory: () => set({ items: [] }),
      getProgress: (mediaId, episodeId) => {
        const found = get().items.find((i) => {
          if (i.id !== mediaId) return false;
          if (episodeId && i.progress.episodeId !== episodeId) return false;
          return true;
        });
        return found?.progress;
      },
      getResumeUrl: (item) => {
        const progress = "progress" in item ? item.progress : undefined;
        if (!progress) return `/watch/${item.id}`;
        const params = new URLSearchParams();
        if (progress.episodeId) {
          params.set("episode", progress.episodeId);
        }
        if (progress.position > 0) {
          params.set("t", Math.floor(progress.position).toString());
        }
        const query = params.toString();
        return query ? `/watch/${item.id}?${query}` : `/watch/${item.id}`;
      },
    }),
    {
      name: "revara-user-watch-history",
    }
  )
);
