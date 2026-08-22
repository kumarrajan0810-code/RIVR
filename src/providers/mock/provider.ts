import { BaseMediaProvider } from "../core/provider";
import type {
  MediaItem,
  Episode,
  Season,
  Stream,
  Subtitle,
  SearchOptions,
  SearchResult,
  MediaType,
  ProviderCapability,
} from "../core/types";
import {
  MOCK_MOVIES,
  MOCK_SERIES,
  MOCK_ANIME,
  MOCK_EPISODES,
  MOCK_STREAMS,
  MOCK_SUBTITLES,
  getAllMedia,
} from "./data";

export class MockProvider extends BaseMediaProvider {
  readonly id = "mock";
  readonly name = "Mock Provider";
  readonly type = "both" as const;
  readonly capabilities: ProviderCapability[] = [
    "search",
    "movie-metadata",
    "series-metadata",
    "anime-metadata",
    "streaming",
    "subtitles",
    "trending",
    "popular",
    "recommendations",
  ];

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const q = query.toLowerCase();
    let items = getAllMedia().filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q) ||
        m.originalTitle?.toLowerCase().includes(q)
    );

    if (options?.type) {
      items = items.filter((m) => m.type === options.type);
    }

    return {
      items,
      total: items.length,
      page: 1,
      totalPages: 1,
    };
  }

  async getMovie(id: string): Promise<MediaItem | null> {
    return MOCK_MOVIES.find((m) => m.id === id) ?? null;
  }

  async getSeries(id: string): Promise<MediaItem | null> {
    return (
      MOCK_SERIES.find((m) => m.id === id) ??
      MOCK_ANIME.find((m) => m.id === id) ??
      null
    );
  }

  async getSeason(seriesId: string, seasonNumber: number): Promise<Season | null> {
    const series =
      MOCK_SERIES.find((m) => m.id === seriesId) ??
      MOCK_ANIME.find((m) => m.id === seriesId);

    if (!series?.seasons) return null;

    const season = series.seasons.find((s) => s.seasonNumber === seasonNumber);
    if (!season) return null;

    const episodes = MOCK_EPISODES[`${seriesId}:${seasonNumber}`] ?? [];
    return { ...season, episodes };
  }

  async getEpisodes(seriesId: string, seasonNumber: number): Promise<Episode[]> {
    return MOCK_EPISODES[`${seriesId}:${seasonNumber}`] ?? [];
  }

  async getTrending(type?: MediaType): Promise<MediaItem[]> {
    let all = getAllMedia();
    if (type) all = all.filter((m) => m.type === type);
    return all.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 12);
  }

  async getPopular(type?: MediaType): Promise<MediaItem[]> {
    let all = getAllMedia();
    if (type) all = all.filter((m) => m.type === type);
    return all.sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0)).slice(0, 12);
  }

  async getRecommendations(mediaId: string): Promise<MediaItem[]> {
    const media = getAllMedia().find((m) => m.id === mediaId);
    if (!media) return [];

    return getAllMedia()
      .filter(
        (m) =>
          m.id !== mediaId &&
          m.genres.some((g) => media.genres.some((mg) => mg.id === g.id))
      )
      .slice(0, 8);
  }

  async getStreams(_mediaId: string, _episodeId?: string): Promise<Stream[]> {
    return MOCK_STREAMS;
  }

  async getSubtitles(_mediaId: string, _episodeId?: string): Promise<Subtitle[]> {
    return MOCK_SUBTITLES;
  }
}
