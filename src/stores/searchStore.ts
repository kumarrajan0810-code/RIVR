"use client";

import { create } from "zustand";
import type { MediaItem, MediaType } from "@/providers/core/types";

interface SearchState {
  query: string;
  results: MediaItem[];
  isLoading: boolean;
  isOpen: boolean;
  activeFilter: MediaType | "all";
  suggestions: string[];
  recentSearches: string[];

  setQuery: (query: string) => void;
  setResults: (results: MediaItem[]) => void;
  setLoading: (loading: boolean) => void;
  setOpen: (open: boolean) => void;
  setFilter: (filter: MediaType | "all") => void;
  setSuggestions: (suggestions: string[]) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isLoading: false,
  isOpen: false,
  activeFilter: "all",
  suggestions: [],
  recentSearches: [],

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ isLoading: loading }),
  setOpen: (open) => set({ isOpen: open }),
  setFilter: (filter) => set({ activeFilter: filter }),
  setSuggestions: (suggestions) => set({ suggestions }),
  addRecentSearch: (query) =>
    set((state) => ({
      recentSearches: [query, ...state.recentSearches.filter((q) => q !== query)].slice(0, 10),
    })),
  clearRecentSearches: () => set({ recentSearches: [] }),
  reset: () => set({ query: "", results: [], isLoading: false }),
}));
