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

export class SuperEmbedProvider extends BaseMediaProvider {
  readonly id = "superembed";
  readonly name = "SuperEmbed / MultiEmbed";
  readonly type = "streaming" as const;
  readonly capabilities: ProviderCapability[] = ["streaming"];

  private baseUrl = "https://multiembed.mov";

  buildPlayerUrl(params: {
    mediaType: MediaType;
    tmdbId?: number;
    season?: number;
    episode?: number;
  }): string | null {
    const { mediaType, tmdbId, season = 1, episode = 1 } = params;
    if (!tmdbId) return null;

    if (mediaType === MediaType.MOVIE) {
      return `${this.baseUrl}/?video_id=${tmdbId}&tmdb=1`;
    }

    if (mediaType === MediaType.SERIES) {
      return `${this.baseUrl}/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
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
        id: `superembed-${mediaId}-${episodeId || "movie"}`,
        title: "MultiEmbed Backup Server",
        url: playerUrl,
        type: StreamType.EXTERNAL,
        quality: Quality.Q1080,
        isHls: false,
        provider: "superembed",
      },
    ];
  }
}

export const superEmbedProvider = new SuperEmbedProvider();
