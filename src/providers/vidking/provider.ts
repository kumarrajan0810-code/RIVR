import { BaseMediaProvider } from "../core/provider";
import {
  MediaType,
  StreamType,
  Quality,
  type Stream,
  type ProviderCapability,
} from "../core/types";
import { getMediaById } from "../mock/data";

export interface VidkingConfig {
  baseUrl?: string;
  themeColor?: string; // hex without '#'
  autoPlay?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
}

export class VidkingProvider extends BaseMediaProvider {
  readonly id = "vidking";
  readonly name = "Vidking Player";
  readonly type = "streaming" as const;
  readonly capabilities: ProviderCapability[] = ["streaming"];

  private vidkingConfig: VidkingConfig = {
    baseUrl: "https://www.vidking.net",
    themeColor: "00DF81", // Revara Sprite Green accent
    autoPlay: true,
    nextEpisode: true,
    episodeSelector: true,
  };

  constructor(config?: Partial<VidkingConfig>) {
    super();
    if (config) {
      this.vidkingConfig = { ...this.vidkingConfig, ...config };
    }
  }

  /**
   * Builds the Vidking embed player URL for movies and TV series
   */
  buildPlayerUrl(params: {
    mediaType: MediaType;
    tmdbId?: number;
    season?: number;
    episode?: number;
    progress?: number;
  }): string | null {
    const { mediaType, tmdbId, season = 1, episode = 1, progress = 0 } = params;
    const { baseUrl, themeColor, autoPlay, nextEpisode, episodeSelector } = this.vidkingConfig;

    if (!tmdbId) return null;

    const queryParams = new URLSearchParams();
    if (themeColor) queryParams.set("color", themeColor);
    if (autoPlay) queryParams.set("autoPlay", "true");
    if (nextEpisode) queryParams.set("nextEpisode", "true");
    if (episodeSelector) queryParams.set("episodeSelector", "true");
    if (progress > 0) queryParams.set("progress", Math.floor(progress).toString());

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    if (mediaType === MediaType.MOVIE) {
      return `${baseUrl}/embed/movie/${tmdbId}${queryString}`;
    }

    if (mediaType === MediaType.SERIES) {
      return `${baseUrl}/embed/tv/${tmdbId}/${season}/${episode}${queryString}`;
    }

    return null;
  }

  async getStreams(mediaId: string, episodeId?: string): Promise<Stream[]> {
    let mediaType: MediaType = MediaType.MOVIE;
    let tmdbId: number | undefined;
    let seasonNum = 1;
    let episodeNum = 1;

    // 1. Parse TMDB ID
    if (mediaId.startsWith("tmdb-movie-")) {
      mediaType = MediaType.MOVIE;
      tmdbId = parseInt(mediaId.replace("tmdb-movie-", ""), 10);
    } else if (mediaId.startsWith("tmdb-tv-")) {
      mediaType = MediaType.SERIES;
      tmdbId = parseInt(mediaId.replace("tmdb-tv-", ""), 10);
    } else {
      const media = getMediaById(mediaId);
      if (media && media.externalIds?.tmdbId) {
        mediaType = media.type;
        tmdbId = media.externalIds.tmdbId;
      }
    }

    if (!tmdbId) return [];

    // 2. Parse episode / season numbers from episodeId
    if (episodeId) {
      const match = episodeId.match(/s?(\d+)[-_:e]e?p?(\d+)/i) || episodeId.match(/(\d+)-(\d+)$/);
      if (match) {
        seasonNum = parseInt(match[1], 10);
        episodeNum = parseInt(match[2], 10);
      } else {
        const epMatch = episodeId.match(/ep-?(\d+)/i);
        if (epMatch) {
          episodeNum = parseInt(epMatch[1], 10);
        }
      }
    }

    const playerUrl = this.buildPlayerUrl({
      mediaType,
      tmdbId,
      season: seasonNum,
      episode: episodeNum,
    });

    if (!playerUrl) return [];

    return [
      {
        id: `vidking-${mediaId}-${episodeId || "movie"}`,
        title: "Vidking 4K Multi-Source Player",
        url: playerUrl,
        type: StreamType.EXTERNAL,
        quality: Quality.Q1080,
        isHls: false,
        provider: "vidking",
      },
    ];
  }
}

export const vidkingProvider = new VidkingProvider();
