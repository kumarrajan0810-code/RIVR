"use client";

import { create } from "zustand";

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
}

interface UserState {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  subtitleLanguage: string;
  playbackQuality: string;
  autoPlayNext: boolean;

  setProfile: (profile: UserProfile) => void;
  setSubtitleLanguage: (lang: string) => void;
  setPlaybackQuality: (quality: string) => void;
  setAutoPlayNext: (auto: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentProfile: {
    id: "user-1",
    name: "Rajan",
    avatar: "",
  },
  profiles: [
    { id: "user-1", name: "Rajan", avatar: "" },
  ],
  subtitleLanguage: "en",
  playbackQuality: "auto",
  autoPlayNext: true,

  setProfile: (profile) => set({ currentProfile: profile }),
  setSubtitleLanguage: (lang) => set({ subtitleLanguage: lang }),
  setPlaybackQuality: (quality) => set({ playbackQuality: quality }),
  setAutoPlayNext: (auto) => set({ autoPlayNext: auto }),
}));
