export interface TMDBMovieRaw {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  genre_ids?: number[];
  tagline?: string;
  status?: string;
  credits?: {
    cast?: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
    crew?: { id: number; name: string; job: string; department: string; profile_path: string | null }[];
  };
  production_companies?: { id: number; name: string; logo_path: string | null }[];
}

export interface TMDBTVRaw {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  genre_ids?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: {
    id: number;
    season_number: number;
    name: string;
    overview?: string;
    poster_path: string | null;
    air_date?: string;
    episode_count: number;
  }[];
  credits?: {
    cast?: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
  };
}

export interface TMDBSeasonRaw {
  id: number;
  season_number: number;
  name: string;
  overview?: string;
  poster_path: string | null;
  air_date?: string;
  episodes: {
    id: number;
    episode_number: number;
    name: string;
    overview?: string;
    still_path: string | null;
    runtime?: number;
    air_date?: string;
    vote_average?: number;
  }[];
}
