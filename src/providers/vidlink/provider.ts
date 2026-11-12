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

export class VidLinkProvider extends BaseMediaProvider {
  readonly id = "vidlink";
  readonly name = "VidLink Pro (Multi-Server)";
  readonly type = "streaming" as const;
  readonly capabilities: ProviderCapability[] = ["streaming"];

  private baseUrl = "https://vidlink.pro";

  buildPlayerUrl(params: {
    mediaType: MediaType;
    tmdbId?: number;
    anilistId?: number;
    season?: number;
    episode?: number;
  }): string | null {
    const { mediaType, tmdbId, anilistId, season = 1, episode = 1 } = params;
    const commonParams = "primaryColor=ffffff&secondaryColor=101010&iconColor=ffffff&autoplay=true";

    if (mediaType === MediaType.ANIME && anilistId) {
      return `${this.baseUrl}/anime/${anilistId}/${episode}?${commonParams}`;
    }

    if (mediaType === MediaType.MOVIE && tmdbId) {
      return `${this.baseUrl}/movie/${tmdbId}?${commonParams}`;
    }

    if (mediaType === MediaType.SERIES && tmdbId) {
      return `${this.baseUrl}/tv/${tmdbId}/${season}/${episode}?${commonParams}`;
    }

    return null;
  }

  async getStreams(mediaId: string, episodeId?: string): Promise<Stream[]> {
    let mediaType: MediaType = MediaType.MOVIE;
    let tmdbId: number | undefined;
    let anilistId: number | undefined;
    let seasonNum = 1;
    let episodeNum = 1;

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
      const media = getMediaById(mediaId);
      if (media) {
        mediaType = media.type;
        tmdbId = media.externalIds?.tmdbId;
        anilistId = media.externalIds?.anilistId;
      }
    }

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
        id: `vidlink-${mediaId}-${episodeId || "movie"}`,
        title: "VidLink Pro (Multi-Server)",
        url: playerUrl,
        type: StreamType.EXTERNAL,
        quality: Quality.Q1080,
        isHls: false,
        provider: "vidlink",
      },
    ];
  }
}

export const vidlinkProvider = new VidLinkProvider();
