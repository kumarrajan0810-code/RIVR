import { BaseMediaProvider } from "../core/provider";
import {
  MediaType,
  StreamType,
  Quality,
  type Stream,
  type ProviderCapability,
} from "../core/types";
import { parseEpisodeInfo } from "@/lib/utils";

interface TorrentioStream {
  title?: string;
  name?: string;
  url?: string;
  behaviorHints?: {
    bingeGroup?: string;
  };
}

interface TorrentioResponse {
  streams?: TorrentioStream[];
}

export class DebridProvider extends BaseMediaProvider {
  readonly id = "debrid";
  readonly name = "High-Speed Debrid CDN (Zero-Buffer)";
  readonly type = "streaming" as const;
  readonly capabilities: ProviderCapability[] = ["streaming"];

  /**
   * Fetches high-bandwidth 10 Gbps direct CDN streams using Torrentio / Real-Debrid / TorBox.
   */
  async getStreams(
    mediaId: string,
    episodeId?: string,
    imdbId?: string,
    debridKey?: string
  ): Promise<Stream[]> {
    if (!imdbId && !mediaId.startsWith("tt")) {
      return [];
    }

    const effectiveImdb = imdbId || (mediaId.startsWith("tt") ? mediaId : null);
    if (!effectiveImdb) return [];

    let mediaType = MediaType.MOVIE;
    if (mediaId.startsWith("tmdb-tv-") || (episodeId && episodeId.length > 0)) {
      mediaType = MediaType.SERIES;
    }

    const configPrefix = debridKey && debridKey.trim().length > 0 ? `realdebrid=${debridKey.trim()}|` : "";
    let endpoint = "";

    if (mediaType === MediaType.MOVIE) {
      endpoint = `https://torrentio.strem.fun/${configPrefix}stream/movie/${effectiveImdb}.json`;
    } else {
      const { season, episode } = parseEpisodeInfo(episodeId);
      endpoint = `https://torrentio.strem.fun/${configPrefix}stream/series/${effectiveImdb}:${season}:${episode}.json`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];

      const data: TorrentioResponse = await res.json();
      if (!data.streams || !Array.isArray(data.streams)) return [];

      const directStreams: Stream[] = [];

      for (let i = 0; i < Math.min(data.streams.length, 4); i++) {
        const item = data.streams[i];
        if (!item.url) continue;

        const is4K = item.name?.includes("4K") || item.title?.includes("4k") || item.title?.includes("2160p");
        const is1080 = item.name?.includes("1080") || item.title?.includes("1080p");
        const quality = is4K ? Quality.Q2160 : is1080 ? Quality.Q1080 : Quality.Q720;
        const serverLabel = item.name ? `[${item.name}] ` : "";
        const titleSummary = item.title?.split("\n")[0] || "Ultra-Fast CDN Stream";

        directStreams.push({
          id: `debrid-${effectiveImdb}-${i}`,
          title: `⚡ ${serverLabel}${titleSummary}`,
          url: item.url,
          type: StreamType.HLS,
          quality,
          isHls: item.url.includes(".m3u8"),
          provider: "debrid",
        });
      }

      return directStreams;
    } catch {
      return [];
    }
  }
}

export const debridProvider = new DebridProvider();
