import {
  MediaType,
  type MediaItem,
  type Season,
  type Episode,
  type CastMember,
  type Genre,
} from "../core/types";
import { getImageUrl, getBackdropUrl } from "@/lib/utils";
import type { TMDBMovieRaw, TMDBTVRaw, TMDBSeasonRaw } from "./types";

const TMDB_GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

export function mapTMDBMovieToMediaItem(raw: TMDBMovieRaw): MediaItem {
  const poster = raw.poster_path ? getImageUrl(raw.poster_path, "w500") : null;
  const backdrop = raw.backdrop_path ? getBackdropUrl(raw.backdrop_path, "w1280") : poster;
  const year = raw.release_date ? new Date(raw.release_date).getFullYear() : undefined;

  const genres: Genre[] = raw.genres
    ? raw.genres.map((g) => ({ id: String(g.id), name: g.name }))
    : (raw.genre_ids || []).map((id) => ({ id: String(id), name: TMDB_GENRE_MAP[id] || "Other" }));

  const cast: CastMember[] = (raw.credits?.cast || []).slice(0, 15).map((c) => ({
    id: String(c.id),
    name: c.name,
    character: c.character,
    profileImage: c.profile_path ? getImageUrl(c.profile_path, "w185") : null,
    order: c.order,
  }));

  return {
    id: `tmdb-movie-${raw.id}`,
    externalIds: { tmdbId: raw.id },
    type: MediaType.MOVIE,
    title: raw.title,
    originalTitle: raw.original_title,
    overview: raw.overview || "No overview available.",
    poster,
    backdrop,
    releaseDate: raw.release_date,
    year,
    rating: raw.vote_average ? Number(raw.vote_average.toFixed(1)) : undefined,
    voteCount: raw.vote_count,
    genres,
    runtime: raw.runtime,
    tagline: raw.tagline,
    status: raw.status,
    cast,
    studios: raw.production_companies?.map((c) => ({ id: String(c.id), name: c.name })) || [],
    provider: "tmdb",
    providerMediaId: String(raw.id),
  };
}

export function mapTMDBTVToMediaItem(raw: TMDBTVRaw): MediaItem {
  const poster = raw.poster_path ? getImageUrl(raw.poster_path, "w500") : null;
  const backdrop = raw.backdrop_path ? getBackdropUrl(raw.backdrop_path, "w1280") : poster;
  const year = raw.first_air_date ? new Date(raw.first_air_date).getFullYear() : undefined;

  const genres: Genre[] = raw.genres
    ? raw.genres.map((g) => ({ id: String(g.id), name: g.name }))
    : (raw.genre_ids || []).map((id) => ({ id: String(id), name: TMDB_GENRE_MAP[id] || "Other" }));

  const cast: CastMember[] = (raw.credits?.cast || []).slice(0, 15).map((c, index) => ({
    id: String(c.id),
    name: c.name,
    character: c.character,
    profileImage: c.profile_path ? getImageUrl(c.profile_path, "w185") : null,
    order: c.order ?? index,
  }));

  const seasons: Season[] = (raw.seasons || [])
    .filter((s) => s.season_number > 0) // filter out specials
    .map((s) => ({
      id: `tmdb-tv-${raw.id}-s${s.season_number}`,
      seasonNumber: s.season_number,
      title: s.name,
      overview: s.overview,
      poster: s.poster_path ? getImageUrl(s.poster_path, "w500") : null,
      airDate: s.air_date,
      episodeCount: s.episode_count,
    }));

  return {
    id: `tmdb-tv-${raw.id}`,
    externalIds: { tmdbId: raw.id },
    type: MediaType.SERIES,
    title: raw.name,
    originalTitle: raw.original_name,
    overview: raw.overview || "No overview available.",
    poster,
    backdrop,
    releaseDate: raw.first_air_date,
    year,
    rating: raw.vote_average ? Number(raw.vote_average.toFixed(1)) : undefined,
    voteCount: raw.vote_count,
    genres,
    runtime: raw.episode_run_time?.[0] || 45,
    cast,
    seasons,
    totalSeasons: raw.number_of_seasons || seasons.length,
    totalEpisodes: raw.number_of_episodes,
    provider: "tmdb",
    providerMediaId: String(raw.id),
  };
}

export function mapTMDBSeasonToEpisodes(seriesId: string, raw: TMDBSeasonRaw): Episode[] {
  return raw.episodes.map((ep) => ({
    id: `tmdb-ep-${seriesId}-${raw.season_number}-${ep.episode_number}`,
    seriesId,
    seasonNumber: raw.season_number,
    episodeNumber: ep.episode_number,
    title: ep.name,
    overview: ep.overview,
    thumbnail: ep.still_path ? getImageUrl(ep.still_path, "w300") : null,
    runtime: ep.runtime,
    airDate: ep.air_date,
    rating: ep.vote_average ? Number(ep.vote_average.toFixed(1)) : undefined,
  }));
}
