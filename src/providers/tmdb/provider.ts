import { BaseMediaProvider } from "../core/provider";
import { tmdbClient } from "./client";
import {
  MediaType,
  type MediaItem,
  type SearchOptions,
  type SearchResult,
  type ProviderCapability,
  type Season,
  type Episode,
} from "../core/types";

const TMDB_MOVIE_GENRES: Record<string, string> = {
  action: "28",
  adventure: "12",
  animation: "16",
  comedy: "35",
  crime: "80",
  documentary: "99",
  drama: "18",
  family: "10751",
  fantasy: "14",
  history: "36",
  horror: "27",
  music: "10402",
  mystery: "9648",
  romance: "10749",
  "sci-fi": "878",
  "science fiction": "878",
  thriller: "53",
  war: "10752",
  western: "37",
};

const TMDB_TV_GENRES: Record<string, string> = {
  action: "10759",
  "action & adventure": "10759",
  adventure: "10759",
  animation: "16",
  comedy: "35",
  crime: "80",
  documentary: "99",
  drama: "18",
  family: "10751",
  kids: "10762",
  mystery: "9648",
  news: "10763",
  reality: "10764",
  "sci-fi": "10765",
  "sci-fi & fantasy": "10765",
  "science fiction": "10765",
  soap: "10766",
  talk: "10767",
  war: "10768",
  "war & politics": "10768",
  western: "37",
};

export class TMDBProvider extends BaseMediaProvider {
  readonly id = "tmdb";
  readonly name = "The Movie Database (TMDB)";
  readonly type = "metadata" as const;
  readonly capabilities: ProviderCapability[] = [
    "search",
    "movie-metadata",
    "series-metadata",
    "trending",
    "popular",
    "recommendations",
  ];

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const page = options?.page || 1;
    const year = options?.year;
    const genre = options?.genre?.toLowerCase().trim();
    const movieGenreId = genre ? TMDB_MOVIE_GENRES[genre] || (/^\d+$/.test(genre) ? genre : undefined) : undefined;
    const tvGenreId = genre ? TMDB_TV_GENRES[genre] || (/^\d+$/.test(genre) ? genre : undefined) : undefined;

    // Discovery / Genre-filtering mode when no text query is passed
    if (!query.trim()) {
      if (options?.type === MediaType.MOVIE) {
        const items = await tmdbClient.getPopularMovies(page, movieGenreId, year);
        return { items, total: items.length * 5, page, totalPages: 5 };
      }
      if (options?.type === MediaType.SERIES) {
        const items = await tmdbClient.getPopularTV(page, tvGenreId, year);
        return { items, total: items.length * 5, page, totalPages: 5 };
      }

      const [movies, tv] = await Promise.all([
        tmdbClient.getPopularMovies(page, movieGenreId, year),
        tmdbClient.getPopularTV(page, tvGenreId, year),
      ]);
      const combined = [...movies, ...tv];
      return {
        items: combined,
        total: combined.length * 5,
        page,
        totalPages: 5,
      };
    }

    // Text search query
    if (options?.type === MediaType.SERIES) {
      const res = await tmdbClient.searchTV(query, page, year);
      if (tvGenreId) {
        res.items = res.items.filter((i) =>
          i.genres.some((g) => g.id === tvGenreId || g.name.toLowerCase().includes(genre!))
        );
      }
      return res;
    }
    if (options?.type === MediaType.MOVIE) {
      const res = await tmdbClient.searchMovies(query, page, year);
      if (movieGenreId) {
        res.items = res.items.filter((i) =>
          i.genres.some((g) => g.id === movieGenreId || g.name.toLowerCase().includes(genre!))
        );
      }
      return res;
    }

    // Search both
    const [moviesRes, tvRes] = await Promise.all([
      tmdbClient.searchMovies(query, page, year),
      tmdbClient.searchTV(query, page, year),
    ]);

    let combined = [...moviesRes.items, ...tvRes.items];
    if (genre) {
      combined = combined.filter((i) =>
        i.genres.some((g) => g.name.toLowerCase().includes(genre!))
      );
    }

    return {
      items: combined,
      total: combined.length,
      page,
      totalPages: Math.max(moviesRes.totalPages, tvRes.totalPages),
    };
  }

  async getMovie(id: string): Promise<MediaItem | null> {
    const cleanId = id.startsWith("tmdb-movie-") ? id.replace("tmdb-movie-", "") : id;
    const numericId = parseInt(cleanId, 10);
    if (isNaN(numericId)) return null;
    return tmdbClient.getMovie(numericId);
  }

  async getSeries(id: string): Promise<MediaItem | null> {
    const cleanId = id.startsWith("tmdb-tv-") ? id.replace("tmdb-tv-", "") : id;
    const numericId = parseInt(cleanId, 10);
    if (isNaN(numericId)) return null;
    return tmdbClient.getTVShow(numericId);
  }

  async getSeason(seriesId: string, seasonNumber: number): Promise<Season | null> {
    const episodes = await this.getEpisodes(seriesId, seasonNumber);
    return {
      id: `season-${seasonNumber}`,
      seasonNumber,
      title: `Season ${seasonNumber}`,
      episodeCount: episodes.length,
      episodes,
    };
  }

  async getEpisodes(seriesId: string, seasonNumber: number): Promise<Episode[]> {
    const cleanId = seriesId.startsWith("tmdb-tv-") ? seriesId.replace("tmdb-tv-", "") : seriesId;
    const numericId = parseInt(cleanId, 10);
    if (isNaN(numericId)) return [];
    return tmdbClient.getSeasonEpisodes(numericId, seasonNumber);
  }

  async getTrending(type?: MediaType): Promise<MediaItem[]> {
    if (type === MediaType.MOVIE) {
      return tmdbClient.getTrendingMovies();
    }
    if (type === MediaType.SERIES) {
      return tmdbClient.getTrendingTV();
    }
    const [movies, tv] = await Promise.all([
      tmdbClient.getTrendingMovies(),
      tmdbClient.getTrendingTV(),
    ]);
    return [...movies, ...tv];
  }

  async getPopular(type?: MediaType): Promise<MediaItem[]> {
    if (type === MediaType.MOVIE) {
      return tmdbClient.getPopularMovies();
    }
    if (type === MediaType.SERIES) {
      return tmdbClient.getPopularTV();
    }
    const [movies, tv] = await Promise.all([
      tmdbClient.getPopularMovies(),
      tmdbClient.getPopularTV(),
    ]);
    return [...movies, ...tv];
  }

  async getRecommendations(mediaId: string): Promise<MediaItem[]> {
    if (mediaId.startsWith("tmdb-movie-")) {
      const numId = parseInt(mediaId.replace("tmdb-movie-", ""), 10);
      return isNaN(numId) ? [] : tmdbClient.getRecommendations("movie", numId);
    }
    if (mediaId.startsWith("tmdb-tv-")) {
      const numId = parseInt(mediaId.replace("tmdb-tv-", ""), 10);
      return isNaN(numId) ? [] : tmdbClient.getRecommendations("tv", numId);
    }
    return [];
  }
}

export const tmdbProvider = new TMDBProvider();
