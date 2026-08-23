import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRuntime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatYear(date: string): string {
  return new Date(date).getFullYear().toString();
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "/placeholder-poster.svg";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: string = "w1280"): string {
  if (!path) return "/placeholder-backdrop.svg";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Robust parser for episode identifiers across TMDB, AniList, and custom formats.
 * e.g.:
 * - "tmdb-ep-tmdb-tv-291496-1-1" -> { season: 1, episode: 1 }
 * - "tmdb-ep-291496-2-4"         -> { season: 2, episode: 4 }
 * - "ep-1-3"                     -> { season: 1, episode: 3 }
 * - "s02e05"                     -> { season: 2, episode: 5 }
 * - "ep-12"                      -> { season: 1, episode: 12 }
 * - "12"                         -> { season: 1, episode: 12 }
 */
export function parseEpisodeInfo(episodeId?: string): { season: number; episode: number } {
  if (!episodeId) {
    return { season: 1, episode: 1 };
  }

  // 1. Matches trailing "-<season>-<episode>" e.g. "tmdb-ep-tmdb-tv-291496-1-2"
  const trailingSeasonEpMatch = episodeId.match(/-(\d+)-(\d+)$/);
  if (trailingSeasonEpMatch) {
    return {
      season: parseInt(trailingSeasonEpMatch[1], 10),
      episode: parseInt(trailingSeasonEpMatch[2], 10),
    };
  }

  // 2. Matches "s<season>e<episode>" or "s<season>_e<episode>" e.g. "s01e02"
  const sMatch = episodeId.match(/s(\d+)[-_:ex]e?p?(\d+)/i);
  if (sMatch) {
    return {
      season: parseInt(sMatch[1], 10),
      episode: parseInt(sMatch[2], 10),
    };
  }

  // 3. Matches "ep-<season>-<episode>"
  const epSeasonMatch = episodeId.match(/ep-(\d+)-(\d+)/i);
  if (epSeasonMatch) {
    return {
      season: parseInt(epSeasonMatch[1], 10),
      episode: parseInt(epSeasonMatch[2], 10),
    };
  }

  // 4. Matches single episode number e.g. "ep-15" or "ep15"
  const singleEpMatch = episodeId.match(/ep-?(\d+)/i);
  if (singleEpMatch) {
    return {
      season: 1,
      episode: parseInt(singleEpMatch[1], 10),
    };
  }

  // 5. Raw number e.g. "5"
  const rawNum = parseInt(episodeId, 10);
  if (!isNaN(rawNum) && rawNum > 0) {
    return { season: 1, episode: rawNum };
  }

  return { season: 1, episode: 1 };
}
