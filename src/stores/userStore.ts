"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  debridApiKey: string;
  debridProvider: "realdebrid" | "torbox";

  setProfile: (profile: UserProfile) => void;
  setSubtitleLanguage: (lang: string) => void;
  setPlaybackQuality: (quality: string) => void;
  setAutoPlayNext: (auto: boolean) => void;
  setDebridApiKey: (key: string) => void;
  setDebridProvider: (provider: "realdebrid" | "torbox") => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
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
      debridApiKey: "",
      debridProvider: "realdebrid",

      setProfile: (profile) => set({ currentProfile: profile }),
      setSubtitleLanguage: (lang) => set({ subtitleLanguage: lang }),
      setPlaybackQuality: (quality) => set({ playbackQuality: quality }),
      setAutoPlayNext: (auto) => set({ autoPlayNext: auto }),
      setDebridApiKey: (key) => set({ debridApiKey: key }),
      setDebridProvider: (provider) => set({ debridProvider: provider }),
    }),
    {
      name: "rivr_user_preferences",
    }
  )
);
