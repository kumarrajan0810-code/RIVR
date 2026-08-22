import { ANIME_SEARCH_QUERY, ANIME_DETAILS_QUERY } from "./queries";
import { mapAniListToMediaItem, type AniListMediaRaw } from "./mapper";
import type { MediaItem, SearchResult } from "../core/types";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

export class AniListClient {
  private async executeQuery<T>(query: string, variables: Record<string, any> = {}): Promise<T | null> {
    try {
      const response = await fetch(ANILIST_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 3600 }, // Next.js cache 1 hr
      });

      if (!response.ok) {
        console.warn(`AniList API responded with status ${response.status}`);
        return null;
      }

      const json = await response.json();
      return json.data;
    } catch (err) {
      console.error("Error connecting to AniList API:", err);
      return null;
    }
  }

  async searchAnime(query: string, page = 1, perPage = 24, genre?: string): Promise<SearchResult> {
    const data = await this.executeQuery<{
      Page: {
        pageInfo: { total: number; currentPage: number; lastPage: number; hasNextPage: boolean };
        media: AniListMediaRaw[];
      };
    }>(ANIME_SEARCH_QUERY, {
      search: query || undefined,
      genre: genre || undefined,
      page,
      perPage,
      sort: query ? ["SEARCH_MATCH", "POPULARITY_DESC"] : ["POPULARITY_DESC"],
    });

    if (!data?.Page) {
      return { items: [], total: 0, page: 1, totalPages: 0 };
    }

    const items = data.Page.media.map(mapAniListToMediaItem);
    return {
      items,
      total: data.Page.pageInfo.total,
      page: data.Page.pageInfo.currentPage,
      totalPages: data.Page.pageInfo.lastPage,
    };
  }

  async getTrendingAnime(perPage = 20): Promise<MediaItem[]> {
    const data = await this.executeQuery<{
      Page: { media: AniListMediaRaw[] };
    }>(ANIME_SEARCH_QUERY, {
      page: 1,
      perPage,
      sort: ["TRENDING_DESC"],
    });

    return (data?.Page?.media || []).map(mapAniListToMediaItem);
  }

  async getPopularAnime(perPage = 20, genre?: string): Promise<MediaItem[]> {
    const data = await this.executeQuery<{
      Page: { media: AniListMediaRaw[] };
    }>(ANIME_SEARCH_QUERY, {
      page: 1,
      perPage,
      genre: genre || undefined,
      sort: ["POPULARITY_DESC"],
    });

    return (data?.Page?.media || []).map(mapAniListToMediaItem);
  }

  async getAnimeDetails(id: number): Promise<MediaItem | null> {
    const data = await this.executeQuery<{
      Media: AniListMediaRaw & {
        recommendations?: {
          nodes?: {
            mediaRecommendation?: AniListMediaRaw;
          }[];
        };
      };
    }>(ANIME_DETAILS_QUERY, { id });

    if (!data?.Media) return null;
    return mapAniListToMediaItem(data.Media);
  }
}

export const aniListClient = new AniListClient();
