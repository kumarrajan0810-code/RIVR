import { BaseMediaProvider } from "../core/provider";
import {
  MediaType,
  StreamType,
  Quality,
  type Stream,
  type ProviderCapability,
} from "../core/types";
import { getMediaById } from "../mock/data";
import { parseEpisodeInfo } from "@/lib/utils";

export interface VideasyConfig {
  baseUrl?: string;
  themeColor?: string; // e.g. "8B5CF6" without '#'
  enableNextEpisode?: boolean;
  enableEpisodeSelector?: boolean;
  autoplayNextEpisode?: boolean;
  enableOverlay?: boolean;
}

export class VideasyProvider extends BaseMediaProvider {
  readonly id = "videasy";
  readonly name = "VIDEASY Streaming";
  readonly type = "streaming" as const;
  readonly capabilities: ProviderCapability[] = ["streaming"];

  private videasyConfig: VideasyConfig = {
    baseUrl: "https://player.videasy.net",
    themeColor: "ffffff", // Netflix-style white accent
    enableNextEpisode: true,
    enableEpisodeSelector: true,
    autoplayNextEpisode: true,
    enableOverlay: true,
  };

  constructor(config?: Partial<VideasyConfig>) {
    super();
    if (config) {
      this.videasyConfig = { ...this.videasyConfig, ...config };
    }
  }

  /**
   * Builds the Videasy player URL for a given media item and episode.
   */
  buildPlayerUrl(params: {
    mediaType: MediaType;
    tmdbId?: number;
    anilistId?: number;
    season?: number;
    episode?: number;
    progress?: number;
  }): string | null {
    const { mediaType, tmdbId, anilistId, season = 1, episode = 1, progress = 0 } = params;
    const { baseUrl, themeColor, enableNextEpisode, enableEpisodeSelector, autoplayNextEpisode, enableOverlay } = this.videasyConfig;

    const queryParams = new URLSearchParams();
    if (themeColor) queryParams.set("color", themeColor);
    if (enableNextEpisode) queryParams.set("nextEpisode", "true");
    if (enableEpisodeSelector) queryParams.set("episodeSelector", "true");
    if (autoplayNextEpisode) queryParams.set("autoplayNextEpisode", "true");
    if (enableOverlay) queryParams.set("overlay", "true");
    if (progress > 0) queryParams.set("progress", Math.floor(progress).toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    if (mediaType === MediaType.ANIME && anilistId) {
      // Anime show vs movie
      if (season && episode) {
        return `${baseUrl}/anime/${anilistId}/${episode}${queryString}`;
      }
      return `${baseUrl}/anime/${anilistId}${queryString}`;
    }

    if (mediaType === MediaType.MOVIE && tmdbId) {
      return `${baseUrl}/movie/${tmdbId}${queryString}`;
    }

    if (mediaType === MediaType.SERIES && tmdbId) {
      return `${baseUrl}/tv/${tmdbId}/${season}/${episode}${queryString}`;
    }

    return null;
  }

  async getStreams(mediaId: string, episodeId?: string): Promise<Stream[]> {
    let mediaType: MediaType = MediaType.MOVIE;
    let tmdbId: number | undefined;
    let anilistId: number | undefined;
    let seasonNum = 1;
    let episodeNum = 1;

    // 1. Direct ID parsing
    if (mediaId.startsWith("anilist-")) {
      mediaType = MediaType.ANIME;
      anilistId = parseInt(mediaId.replace("anilist-", ""), 10);
    } else if (mediaId.startsWith("tmdb-movie-")) {
      mediaType = MediaType.MOVIE;
      tmdbId = parseInt(mediaId.replace("tmdb-movie-", ""), 10);
    } else if (mediaId.startsWith("tmdb-tv-")) {
      mediaType = MediaType.SERIES;
      tmdbId = parseInt(mediaId.replace("tmdb-tv-", ""), 10);
    } else {
      // Look up via mock or registry
      const media = getMediaById(mediaId);
      if (media) {
        mediaType = media.type;
        tmdbId = media.externalIds?.tmdbId;
        anilistId = media.externalIds?.anilistId;
      }
    }

    // 2. Parse episode / season numbers from episodeId
    if (episodeId) {
      const parsed = parseEpisodeInfo(episodeId);
      seasonNum = parsed.season;
      episodeNum = parsed.episode;
    }

    const playerUrl = this.buildPlayerUrl({
      mediaType,
      tmdbId,
      anilistId,
      season: seasonNum,
      episode: episodeNum,
    });

    if (!playerUrl) return [];

    return [
      {
        id: `videasy-${mediaId}-${episodeId || "movie"}`,
        title: "VIDEASY Cloud Player",
        url: playerUrl,
        type: StreamType.EXTERNAL,
        quality: Quality.Q1080,
        isHls: false,
        provider: "videasy",
      },
    ];
  }
}

export const videasyProvider = new VideasyProvider();
