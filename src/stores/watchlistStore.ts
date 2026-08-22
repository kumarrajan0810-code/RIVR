"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaItem } from "@/providers/core/types";

interface WatchlistState {
  items: MediaItem[];
  addItem: (item: MediaItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: MediaItem) => void;
  isInList: (id: string) => boolean;
  clearList: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [item, ...state.items] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      toggleItem: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) {
          get().removeItem(item.id);
        } else {
          get().addItem(item);
        }
      },
      isInList: (id) => get().items.some((i) => i.id === id),
      clearList: () => set({ items: [] }),
    }),
    {
      name: "revara-user-watchlist",
    }
  )
);
