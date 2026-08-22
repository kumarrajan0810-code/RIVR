import {
  mapTMDBMovieToMediaItem,
  mapTMDBTVToMediaItem,
  mapTMDBSeasonToEpisodes,
} from "./mapper";
import type { TMDBMovieRaw, TMDBTVRaw, TMDBSeasonRaw } from "./types";
import type { MediaItem, Episode, SearchResult } from "../core/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_TMDB_API_KEY = "96b40e1533d4a4d054400e11df3a7cc1";

export class TMDBClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey =
      apiKey ||
      process.env.TMDB_API_KEY ||
      process.env.NEXT_PUBLIC_TMDB_API_KEY ||
      DEFAULT_TMDB_API_KEY;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private async fetchFromTMDB<T>(path: string, params: Record<string, string | number | boolean> = {}): Promise<T | null> {
    if (!this.hasApiKey()) {
      return null;
    }

    const url = new URL(`${TMDB_BASE_URL}${path}`);
    url.searchParams.set("api_key", this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url.toString(), {
          next: { revalidate: 3600 }, // Cache 1 hour
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.warn("TMDB API Key is invalid or unauthorized.");
          }
          return null;
        }

        return await res.json();
      } catch (err) {
        if (attempt === maxRetries) {
          console.error(`TMDB fetch error on ${path} after ${maxRetries + 1} attempts:`, err);
          return null;
        }
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
    return null;
  }

  async searchMovies(query: string, page = 1): Promise<SearchResult> {
    const data = await this.fetchFromTMDB<{
      results: TMDBMovieRaw[];
      total_results: number;
      page: number;
      total_pages: number;
    }>("/search/movie", { query, page, include_adult: false });

    if (!data) return { items: [], total: 0, page: 1, totalPages: 0 };

    return {
      items: data.results.map(mapTMDBMovieToMediaItem),
      total: data.total_results,
      page: data.page,
      totalPages: data.total_pages,
    };
  }

  async searchTV(query: string, page = 1): Promise<SearchResult> {
    const data = await this.fetchFromTMDB<{
      results: TMDBTVRaw[];
      total_results: number;
      page: number;
      total_pages: number;
    }>("/search/tv", { query, page, include_adult: false });

    if (!data) return { items: [], total: 0, page: 1, totalPages: 0 };

    return {
      items: data.results.map(mapTMDBTVToMediaItem),
      total: data.total_results,
      page: data.page,
      totalPages: data.total_pages,
    };
  }

  async getTrendingMovies(timeWindow = "day"): Promise<MediaItem[]> {
    const data = await this.fetchFromTMDB<{ results: TMDBMovieRaw[] }>(
      `/trending/movie/${timeWindow}`
    );
    return (data?.results || []).map(mapTMDBMovieToMediaItem);
  }

  async getTrendingTV(timeWindow = "day"): Promise<MediaItem[]> {
    const data = await this.fetchFromTMDB<{ results: TMDBTVRaw[] }>(
      `/trending/tv/${timeWindow}`
    );
    return (data?.results || []).map(mapTMDBTVToMediaItem);
  }

  async getPopularMovies(page = 1, genreId?: string): Promise<MediaItem[]> {
    const endpoint = genreId ? "/discover/movie" : "/movie/popular";
    const data = await this.fetchFromTMDB<{ results: TMDBMovieRaw[] }>(endpoint, {
      page,
      with_genres: genreId || "",
    });
    return (data?.results || []).map(mapTMDBMovieToMediaItem);
  }

  async getPopularTV(page = 1, genreId?: string): Promise<MediaItem[]> {
    const endpoint = genreId ? "/discover/tv" : "/tv/popular";
    const data = await this.fetchFromTMDB<{ results: TMDBTVRaw[] }>(endpoint, {
      page,
      with_genres: genreId || "",
    });
    return (data?.results || []).map(mapTMDBTVToMediaItem);
  }

  async getMovie(id: number): Promise<MediaItem | null> {
    const data = await this.fetchFromTMDB<TMDBMovieRaw>(`/movie/${id}`, {
      append_to_response: "credits",
    });
    if (!data) return null;
    return mapTMDBMovieToMediaItem(data);
  }

  async getTVShow(id: number): Promise<MediaItem | null> {
    const data = await this.fetchFromTMDB<TMDBTVRaw>(`/tv/${id}`, {
      append_to_response: "credits",
    });
    if (!data) return null;
    return mapTMDBTVToMediaItem(data);
  }

  async getSeasonEpisodes(tvId: number, seasonNumber: number): Promise<Episode[]> {
    const data = await this.fetchFromTMDB<TMDBSeasonRaw>(
      `/tv/${tvId}/season/${seasonNumber}`
    );
    if (!data) return [];
    return mapTMDBSeasonToEpisodes(`tmdb-tv-${tvId}`, data);
  }

  async getRecommendations(type: "movie" | "tv", id: number): Promise<MediaItem[]> {
    const data = await this.fetchFromTMDB<{ results: any[] }>(
      `/${type}/${id}/recommendations`
    );
    if (!data?.results) return [];
    return data.results.map((r) =>
      type === "movie" ? mapTMDBMovieToMediaItem(r) : mapTMDBTVToMediaItem(r)
    );
  }

  async getByNetwork(networkId: number, page = 1): Promise<MediaItem[]> {
    const data = await this.fetchFromTMDB<{ results: TMDBTVRaw[] }>("/discover/tv", {
      with_networks: networkId,
      sort_by: "popularity.desc",
      page,
    });
    return (data?.results || []).map(mapTMDBTVToMediaItem);
  }

  async getByWatchProvider(providerId: number, type: "movie" | "tv" = "tv", page = 1): Promise<MediaItem[]> {
    const endpoint = type === "movie" ? "/discover/movie" : "/discover/tv";
    const data = await this.fetchFromTMDB<{ results: any[] }>(endpoint, {
      with_watch_providers: providerId,
      watch_region: "US",
      sort_by: "popularity.desc",
      page,
    });
    if (!data?.results) return [];
    return data.results.map((r) =>
      type === "movie" ? mapTMDBMovieToMediaItem(r) : mapTMDBTVToMediaItem(r)
    );
  }

  async getPersonDetails(personId: number) {
    const data = await this.fetchFromTMDB<any>(`/person/${personId}`, {
      append_to_response: "combined_credits",
    });
    if (!data) return null;

    const isDirector = data.known_for_department === "Directing";

    // Directing credits (where job is Director)
    const directedList: MediaItem[] = (data.combined_credits?.crew || [])
      .filter((c: any) => c.job === "Director" && (c.poster_path || c.backdrop_path))
    // Cast / Acting credits
    const castList: MediaItem[] = (data.combined_credits?.cast || [])
      .filter((c: any) => c.poster_path || c.backdrop_path)
      .map((c: any) => (c.media_type === "movie" ? mapTMDBMovieToMediaItem(c) : mapTMDBTVToMediaItem(c)))
      .filter((v: any, i: number, a: any[]) => a.findIndex((t) => t.id === v.id) === i);

    return {
      id: data.id,
      name: data.name,
      biography: data.biography,
      birthday: data.birthday,
      placeOfBirth: data.place_of_birth,
      profilePath: data.profile_path ? `https://image.tmdb.org/t/p/h632${data.profile_path}` : null,
      knownForDepartment: data.known_for_department,
      isDirector,
      directed: directedList,
      cast: castList,
    };
  }

  async searchPerson(query: string, page = 1) {
    const data = await this.fetchFromTMDB<{
      results: any[];
      total_results: number;
      page: number;
      total_pages: number;
    }>("/search/person", { query, page, include_adult: false });

    if (!data?.results) return [];

    return data.results
      .filter((p) => p.profile_path)
      .map((p) => {
        const isDirector = p.known_for_department === "Directing";
        const knownForTitles = (p.known_for || [])
          .map((k: any) => k.title || k.name)
          .filter(Boolean)
          .slice(0, 3)
          .join(", ");

        return {
          id: `star-${p.id}`,
          tmdbId: p.id,
          name: p.name,
          role: isDirector ? ("FROM" as const) : ("FEATURING" as const),
          type: isDirector ? ("director" as const) : ("actor" as const),
          knownFor: knownForTitles || p.known_for_department || "Cinema",
          image: `https://image.tmdb.org/t/p/w500${p.profile_path}`,
          searchQuery: p.name,
        };
      });
  }

  async getPopularPersons(page = 1) {
    const data = await this.fetchFromTMDB<{
      results: any[];
      total_results: number;
      page: number;
      total_pages: number;
    }>("/person/popular", { page });

    if (!data?.results) return [];

    return data.results
      .filter((p) => p.profile_path)
      .map((p) => {
        const isDirector = p.known_for_department === "Directing";
        const knownForTitles = (p.known_for || [])
          .map((k: any) => k.title || k.name)
          .filter(Boolean)
          .slice(0, 3)
          .join(", ");

        return {
          id: `star-${p.id}`,
          tmdbId: p.id,
          name: p.name,
          role: isDirector ? ("FROM" as const) : ("FEATURING" as const),
          type: isDirector ? ("director" as const) : ("actor" as const),
          knownFor: knownForTitles || p.known_for_department || "Cinema",
          image: `https://image.tmdb.org/t/p/w500${p.profile_path}`,
          searchQuery: p.name,
        };
      });
  }
}

export const tmdbClient = new TMDBClient();
