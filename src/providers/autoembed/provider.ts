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

export class AutoEmbedProvider extends BaseMediaProvider {
  readonly id = "autoembed";
  readonly name = "SmashyStream Cloud";
  readonly type = "streaming" as const;
  readonly capabilities: ProviderCapability[] = ["streaming"];

  private baseUrl = "https://player.smashystream.com";

  buildPlayerUrl(params: {
    mediaType: MediaType;
    tmdbId?: number;
    season?: number;
    episode?: number;
  }): string | null {
    const { mediaType, tmdbId, season = 1, episode = 1 } = params;
    if (!tmdbId) return null;

    if (mediaType === MediaType.MOVIE) {
      return `${this.baseUrl}/movie/${tmdbId}`;
    }

    if (mediaType === MediaType.SERIES) {
      return `${this.baseUrl}/tv/${tmdbId}?s=${season}&e=${episode}`;
    }

    return null;
  }

  async getStreams(mediaId: string, episodeId?: string): Promise<Stream[]> {
    let mediaType: MediaType = MediaType.MOVIE;
    let tmdbId: number | undefined;
    let seasonNum = 1;
    let episodeNum = 1;

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

    if (episodeId) {
      const parsed = parseEpisodeInfo(episodeId);
      seasonNum = parsed.season;
      episodeNum = parsed.episode;
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
        id: `smashy-${mediaId}-${episodeId || "movie"}`,
        title: "SmashyStream Fast Cloud",
        url: playerUrl,
        type: StreamType.EXTERNAL,
        quality: Quality.Q1080,
        isHls: false,
        provider: "autoembed",
      },
    ];
  }
}

export const autoEmbedProvider = new AutoEmbedProvider();
