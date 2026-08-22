// ===== Core Media Types =====
// All providers normalize their data into these types.
// The frontend ONLY works with these types — never with provider-specific response shapes.

export enum MediaType {
  MOVIE = "movie",
  SERIES = "series",
  ANIME = "anime",
}

export enum StreamType {
  HLS = "hls",
  MP4 = "mp4",
  DASH = "dash",
  EXTERNAL = "external",
}

export enum SubtitleFormat {
  VTT = "vtt",
  SRT = "srt",
  ASS = "ass",
}

export enum Quality {
  AUTO = "auto",
  Q2160 = "2160p",
  Q1080 = "1080p",
  Q720 = "720p",
  Q480 = "480p",
  Q360 = "360p",
}

export type ProviderCapability =
  | "search"
  | "movie-metadata"
  | "series-metadata"
  | "anime-metadata"
  | "streaming"
  | "subtitles"
  | "trending"
  | "popular"
  | "recommendations"
  | "watch-history"
  | "user-library";

// ===== Media Item =====

export interface MediaItem {
  id: string;
  externalIds?: ExternalIds;
  type: MediaType;
  title: string;
  originalTitle?: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  releaseDate?: string;
  year?: number;
  rating?: number;
  voteCount?: number;
  genres: Genre[];
  runtime?: number;
  status?: string;
  tagline?: string;
  cast?: CastMember[];
  directors?: CrewMember[];
  studios?: Studio[];
  seasons?: Season[];
  totalSeasons?: number;
  totalEpisodes?: number;
  provider: string;
  providerMediaId?: string;
  language?: string;
  popularity?: number;
}

export interface ExternalIds {
  tmdbId?: number;
  imdbId?: string;
  anilistId?: number;
  malId?: number;
  jellyfinId?: string;
  tvdbId?: number;
}

// ===== Season =====

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  overview?: string;
  poster?: string | null;
  airDate?: string;
  episodeCount: number;
  episodes?: Episode[];
}

// ===== Episode =====

export interface Episode {
  id: string;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  overview?: string;
  thumbnail: string | null;
  runtime?: number;
  airDate?: string;
  rating?: number;
  still?: string | null;
}

// ===== Stream =====

export interface Stream {
  id: string;
  title: string;
  url: string;
  type: StreamType;
  quality: Quality;
  language?: string;
  audio?: AudioTrack[];
  subtitles?: Subtitle[];
  isHls: boolean;
  provider: string;
  headers?: Record<string, string>;
}

export interface AudioTrack {
  id: string;
  language: string;
  label: string;
  isDefault: boolean;
}

// ===== Subtitle =====

export interface Subtitle {
  id: string;
  language: string;
  label: string;
  url: string;
  format: SubtitleFormat;
  provider: string;
  isDefault?: boolean;
}

// ===== Genre =====

export interface Genre {
  id: string;
  name: string;
}

// ===== Cast & Crew =====

export interface CastMember {
  id: string;
  name: string;
  character: string;
  profileImage: string | null;
  order: number;
}

export interface CrewMember {
  id: string;
  name: string;
  job: string;
  department: string;
  profileImage: string | null;
}

// ===== Studio =====

export interface Studio {
  id: string;
  name: string;
  logo?: string | null;
}

// ===== Watch Progress =====

export interface WatchProgress {
  mediaId: string;
  episodeId?: string;
  position: number; // seconds
  duration: number; // seconds
  percentage: number;
  lastWatched: string; // ISO date
  completed: boolean;
}

// ===== Watchlist Item =====

export interface WatchlistItem {
  id: string;
  mediaId: string;
  media: MediaItem;
  addedAt: string;
}

// ===== Search =====

export interface SearchOptions {
  type?: MediaType;
  genre?: string;
  year?: number;
  page?: number;
  limit?: number;
  sort?: "popularity" | "rating" | "release_date" | "title";
}

export interface SearchResult {
  items: MediaItem[];
  total: number;
  page: number;
  totalPages: number;
}

// ===== Provider Config =====

export interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  type: "metadata" | "streaming" | "both";
  capabilities: ProviderCapability[];
  settings?: Record<string, string>;
  status?: "connected" | "disconnected" | "error";
  lastSync?: string;
}
