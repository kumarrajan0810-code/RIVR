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

export class AtlanticProvider extends BaseMediaProvider {
  readonly id = "atlantic";
  readonly name = "Atlantic (Embed API)";
  readonly type = "streaming" as const;
  readonly capabilities: ProviderCapability[] = ["streaming"];

  private baseUrl = "https://atlantic.bz/embed";

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

    if (mediaType === MediaType.SERIES || mediaType === MediaType.ANIME) {
      return `${this.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
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
    } else if (mediaId.startsWith("anilist-")) {
      mediaType = MediaType.ANIME;
      const media = getMediaById(mediaId);
      tmdbId = media?.externalIds?.tmdbId;
    } else {
      const media = getMediaById(mediaId);
      if (media) {
        mediaType = media.type;
        tmdbId = media.externalIds?.tmdbId;
      }
    }

    if (episodeId) {
      const parsed = parseEpisodeInfo(episodeId);
      if (parsed) {
        seasonNum = parsed.season;
        episodeNum = parsed.episode;
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
        id: `atlantic-${mediaId}-${episodeId || "movie"}`,
        title: "Atlantic (Embed API)",
        url: playerUrl,
        type: StreamType.EXTERNAL,
        quality: Quality.Q1080,
        isHls: false,
        provider: "atlantic",
      },
    ];
  }
}

export const atlanticProvider = new AtlanticProvider();

