import { providerRegistry } from "./registry";
import type {
  MediaItem,
  Episode,
  Season,
  Stream,
  Subtitle,
  SearchOptions,
  SearchResult,
  MediaType,
} from "./types";

/**
 * Media Aggregator — searches across all enabled providers, deduplicates and merges results.
 * This is the main entry point for the API routes.
 */
export class MediaAggregator {
  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const providers = providerRegistry.getByCapability("search");
    const results = await Promise.allSettled(
      providers.map((p) => p.search(query, options))
    );

    const allItems: MediaItem[] = [];
    let total = 0;

    for (const result of results) {
      if (result.status === "fulfilled") {
        allItems.push(...result.value.items);
        total += result.value.total;
      }
    }

    // Deduplicate by external IDs
    const deduped = this.deduplicateItems(allItems);

    return {
      items: deduped,
      total,
      page: options?.page ?? 1,
      totalPages: Math.ceil(total / (options?.limit ?? 20)),
    };
  }

  async getMovie(id: string, providerId?: string): Promise<MediaItem | null> {
    if (providerId) {
      const provider = providerRegistry.get(providerId);
      return provider?.getMovie(id) ?? null;
    }

    const providers = providerRegistry.getByCapability("movie-metadata");
    for (const provider of providers) {
      const movie = await provider.getMovie(id);
      if (movie) return movie;
    }
    return null;
  }

  async getSeries(id: string, providerId?: string): Promise<MediaItem | null> {
    if (providerId) {
      const provider = providerRegistry.get(providerId);
      return provider?.getSeries(id) ?? null;
    }

    const providers = providerRegistry.getByCapability("series-metadata");
    for (const provider of providers) {
      const series = await provider.getSeries(id);
      if (series) return series;
    }
    return null;
  }

  async getSeason(seriesId: string, seasonNumber: number, providerId?: string): Promise<Season | null> {
    if (providerId) {
      const provider = providerRegistry.get(providerId);
      return provider?.getSeason(seriesId, seasonNumber) ?? null;
    }

    const providers = providerRegistry.getMetadataProviders();
    for (const provider of providers) {
      const season = await provider.getSeason(seriesId, seasonNumber);
      if (season) return season;
    }
    return null;
  }

  async getEpisodes(seriesId: string, seasonNumber: number, providerId?: string): Promise<Episode[]> {
    if (providerId) {
      const provider = providerRegistry.get(providerId);
      return provider?.getEpisodes(seriesId, seasonNumber) ?? [];
    }

    const providers = providerRegistry.getMetadataProviders();
    for (const provider of providers) {
      const episodes = await provider.getEpisodes(seriesId, seasonNumber);
      if (episodes.length > 0) return episodes;
    }
    return [];
  }

  async getTrending(type?: MediaType): Promise<MediaItem[]> {
    const providers = providerRegistry.getByCapability("trending");
    const results = await Promise.allSettled(
      providers.map((p) => p.getTrending(type))
    );

    const allItems: MediaItem[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      }
    }
    return this.deduplicateItems(allItems);
  }

  async getPopular(type?: MediaType): Promise<MediaItem[]> {
    const providers = providerRegistry.getByCapability("popular");
    const results = await Promise.allSettled(
      providers.map((p) => p.getPopular(type))
    );

    const allItems: MediaItem[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      }
    }
    return this.deduplicateItems(allItems);
  }

  async getRecommendations(mediaId: string): Promise<MediaItem[]> {
    const providers = providerRegistry.getByCapability("recommendations");
    const results = await Promise.allSettled(
      providers.map((p) => p.getRecommendations(mediaId))
    );

    const allItems: MediaItem[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      }
    }
    return this.deduplicateItems(allItems);
  }

  async getStreams(mediaId: string, episodeId?: string): Promise<Stream[]> {
    const providers = providerRegistry.getStreamingProviders();
    const results = await Promise.allSettled(
      providers.map((p) => p.getStreams(mediaId, episodeId))
    );

    const allStreams: Stream[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allStreams.push(...result.value);
      }
    }
    return allStreams;
  }

  async getSubtitles(mediaId: string, episodeId?: string): Promise<Subtitle[]> {
    const providers = providerRegistry.getByCapability("subtitles");
    const results = await Promise.allSettled(
      providers.map((p) => p.getSubtitles(mediaId, episodeId))
    );

    const allSubs: Subtitle[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allSubs.push(...result.value);
      }
    }
    return allSubs;
  }

  private deduplicateItems(items: MediaItem[]): MediaItem[] {
    const seen = new Map<string, MediaItem>();

    for (const item of items) {
      const key = this.getDedupeKey(item);
      if (!seen.has(key)) {
        seen.set(key, item);
      }
    }

    return Array.from(seen.values());
  }

  private getDedupeKey(item: MediaItem): string {
    // Prefer external IDs for deduplication
    if (item.externalIds?.tmdbId) return `tmdb:${item.externalIds.tmdbId}`;
    if (item.externalIds?.imdbId) return `imdb:${item.externalIds.imdbId}`;
    if (item.externalIds?.anilistId) return `anilist:${item.externalIds.anilistId}`;
    return `${item.provider}:${item.id}`;
  }
}

export const mediaAggregator = new MediaAggregator();
