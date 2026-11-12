import { BaseMediaProvider } from "../core/provider";
import { aniListClient } from "./client";
import {
  MediaType,
  type MediaItem,
  type SearchOptions,
  type SearchResult,
  type ProviderCapability,
  type Season,
  type Episode,
} from "../core/types";

export class AniListProvider extends BaseMediaProvider {
  readonly id = "anilist";
  readonly name = "AniList Anime Database";
  readonly type = "metadata" as const;
  readonly capabilities: ProviderCapability[] = [
    "search",
    "anime-metadata",
    "trending",
    "popular",
    "recommendations",
  ];

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    if (options?.type && options.type !== MediaType.ANIME) {
      return { items: [], total: 0, page: 1, totalPages: 0 };
    }
    return aniListClient.searchAnime(
      query,
      options?.page || 1,
      options?.limit || 24,
      options?.genre,
      options?.year
    );
  }

  async getMovie(id: string): Promise<MediaItem | null> {
    return this.getSeries(id);
  }

  async getSeries(id: string): Promise<MediaItem | null> {
    const cleanId = id.startsWith("anilist-") ? id.replace("anilist-", "") : id;
    const numericId = parseInt(cleanId, 10);
    if (isNaN(numericId)) return null;
    return aniListClient.getAnimeDetails(numericId);
  }

  async getSeason(seriesId: string, _seasonNumber: number): Promise<Season | null> {
    const series = await this.getSeries(seriesId);
    return series?.seasons?.[0] || null;
  }

  async getEpisodes(seriesId: string, _seasonNumber: number): Promise<Episode[]> {
    const series = await this.getSeries(seriesId);
    return series?.seasons?.[0]?.episodes || [];
  }

  async getTrending(type?: MediaType): Promise<MediaItem[]> {
    if (type && type !== MediaType.ANIME) return [];
    return aniListClient.getTrendingAnime(20);
  }

  async getPopular(type?: MediaType): Promise<MediaItem[]> {
    if (type && type !== MediaType.ANIME) return [];
    return aniListClient.getPopularAnime(20);
  }

  async getRecommendations(mediaId: string): Promise<MediaItem[]> {
    const cleanId = mediaId.startsWith("anilist-") ? mediaId.replace("anilist-", "") : mediaId;
    const numericId = parseInt(cleanId, 10);
    if (isNaN(numericId)) return [];
    const item = await aniListClient.getAnimeDetails(numericId);
    if (!item) return [];
    return aniListClient.getPopularAnime(10, item.genres[0]?.name);
  }
}

export const aniListProvider = new AniListProvider();
