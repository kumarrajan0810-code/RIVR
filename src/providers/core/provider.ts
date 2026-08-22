import {
  type MediaItem,
  type Episode,
  type Season,
  type Stream,
  type Subtitle,
  type SearchOptions,
  type SearchResult,
  type ProviderCapability,
  type MediaType,
  type ProviderConfig,
} from "./types";

/**
 * MediaProvider interface — all providers must implement this.
 * 
 * Providers return data in the normalized types defined in ./types.ts.
 * The frontend never interacts with provider-specific APIs directly.
 */
export interface MediaProvider {
  /** Unique provider identifier */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Provider type: metadata-only, streaming-only, or both */
  readonly type: "metadata" | "streaming" | "both";

  /** List of capabilities this provider supports */
  readonly capabilities: ProviderCapability[];

  /** Initialize / authenticate the provider */
  initialize(config?: Record<string, string>): Promise<void>;

  /** Test connection to the provider */
  testConnection(): Promise<boolean>;

  /** Get provider configuration */
  getConfig(): ProviderConfig;

  // === Search ===
  search(query: string, options?: SearchOptions): Promise<SearchResult>;

  // === Movie ===
  getMovie(id: string): Promise<MediaItem | null>;

  // === Series ===
  getSeries(id: string): Promise<MediaItem | null>;
  getSeason(seriesId: string, seasonNumber: number): Promise<Season | null>;
  getEpisodes(seriesId: string, seasonNumber: number): Promise<Episode[]>;

  // === Discovery ===
  getTrending(type?: MediaType): Promise<MediaItem[]>;
  getPopular(type?: MediaType): Promise<MediaItem[]>;
  getRecommendations(mediaId: string): Promise<MediaItem[]>;
  getGenreItems?(genreId: string, type?: MediaType): Promise<MediaItem[]>;

  // === Playback ===
  getStreams(mediaId: string, episodeId?: string): Promise<Stream[]>;
  getSubtitles(mediaId: string, episodeId?: string): Promise<Subtitle[]>;
}

/**
 * Base class for providers with shared boilerplate.
 * Providers can extend this to get default implementations of optional methods.
 */
export abstract class BaseMediaProvider implements MediaProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly type: "metadata" | "streaming" | "both";
  abstract readonly capabilities: ProviderCapability[];

  protected config: Record<string, string> = {};

  async initialize(config?: Record<string, string>): Promise<void> {
    if (config) this.config = config;
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  getConfig(): ProviderConfig {
    return {
      id: this.id,
      name: this.name,
      enabled: true,
      type: this.type,
      capabilities: this.capabilities,
      status: "connected",
    };
  }

  async search(_query: string, _options?: SearchOptions): Promise<SearchResult> {
    return { items: [], total: 0, page: 1, totalPages: 0 };
  }

  async getMovie(_id: string): Promise<MediaItem | null> {
    return null;
  }

  async getSeries(_id: string): Promise<MediaItem | null> {
    return null;
  }

  async getSeason(_seriesId: string, _seasonNumber: number): Promise<Season | null> {
    return null;
  }

  async getEpisodes(_seriesId: string, _seasonNumber: number): Promise<Episode[]> {
    return [];
  }

  async getTrending(_type?: MediaType): Promise<MediaItem[]> {
    return [];
  }

  async getPopular(_type?: MediaType): Promise<MediaItem[]> {
    return [];
  }

  async getRecommendations(_mediaId: string): Promise<MediaItem[]> {
    return [];
  }

  async getStreams(_mediaId: string, _episodeId?: string): Promise<Stream[]> {
    return [];
  }

  async getSubtitles(_mediaId: string, _episodeId?: string): Promise<Subtitle[]> {
    return [];
  }
}
