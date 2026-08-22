"use client";

import { create } from "zustand";
import type { Stream, Subtitle, Quality } from "@/providers/core/types";

interface PlayerState {
  // Playback
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  playbackRate: number;
  isBuffering: boolean;

  // Media
  currentStream: Stream | null;
  availableStreams: Stream[];
  selectedQuality: Quality | "auto";

  // Subtitles
  currentSubtitle: Subtitle | null;
  availableSubtitles: Subtitle[];
  subtitlesEnabled: boolean;

  // UI
  controlsVisible: boolean;
  settingsOpen: boolean;
  episodeDrawerOpen: boolean;

  // Episode context
  mediaId: string | null;
  episodeId: string | null;
  seriesTitle: string | null;
  episodeTitle: string | null;
  nextEpisodeId: string | null;
  showNextEpisode: boolean;

  // Actions
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setFullscreen: (fs: boolean) => void;
  setPiP: (pip: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setBuffering: (buffering: boolean) => void;
  setStream: (stream: Stream) => void;
  setAvailableStreams: (streams: Stream[]) => void;
  setQuality: (quality: Quality | "auto") => void;
  setSubtitle: (subtitle: Subtitle | null) => void;
  setAvailableSubtitles: (subs: Subtitle[]) => void;
  toggleSubtitles: () => void;
  setControlsVisible: (visible: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setEpisodeDrawerOpen: (open: boolean) => void;
  setMediaContext: (ctx: {
    mediaId: string;
    episodeId?: string;
    seriesTitle?: string;
    episodeTitle?: string;
    nextEpisodeId?: string;
  }) => void;
  setShowNextEpisode: (show: boolean) => void;
  reset: () => void;
}

const initialState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  isPiP: false,
  playbackRate: 1,
  isBuffering: false,
  currentStream: null,
  availableStreams: [],
  selectedQuality: "auto" as const,
  currentSubtitle: null,
  availableSubtitles: [],
  subtitlesEnabled: false,
  controlsVisible: true,
  settingsOpen: false,
  episodeDrawerOpen: false,
  mediaId: null,
  episodeId: null,
  seriesTitle: null,
  episodeTitle: null,
  nextEpisodeId: null,
  showNextEpisode: false,
};

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initialState,

  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () =>
    set((state) => ({ isMuted: !state.isMuted })),
  setFullscreen: (fs) => set({ isFullscreen: fs }),
  setPiP: (pip) => set({ isPiP: pip }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setBuffering: (buffering) => set({ isBuffering: buffering }),
  setStream: (stream) => set({ currentStream: stream }),
  setAvailableStreams: (streams) => set({ availableStreams: streams }),
  setQuality: (quality) => set({ selectedQuality: quality }),
  setSubtitle: (subtitle) => set({ currentSubtitle: subtitle, subtitlesEnabled: subtitle !== null }),
  setAvailableSubtitles: (subs) => set({ availableSubtitles: subs }),
  toggleSubtitles: () =>
    set((state) => ({ subtitlesEnabled: !state.subtitlesEnabled })),
  setControlsVisible: (visible) => set({ controlsVisible: visible }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setEpisodeDrawerOpen: (open) => set({ episodeDrawerOpen: open }),
  setMediaContext: (ctx) =>
    set({
      mediaId: ctx.mediaId,
      episodeId: ctx.episodeId ?? null,
      seriesTitle: ctx.seriesTitle ?? null,
      episodeTitle: ctx.episodeTitle ?? null,
      nextEpisodeId: ctx.nextEpisodeId ?? null,
    }),
  setShowNextEpisode: (show) => set({ showNextEpisode: show }),
  reset: () => set(initialState),
}));
