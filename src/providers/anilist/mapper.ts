import {
  MediaType,
  type MediaItem,
  type Season,
  type Episode,
  type CastMember,
  type Genre,
} from "../core/types";

export interface AniListMediaRaw {
  id: number;
  idMal?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage?: {
    extraLarge?: string;
    large?: string;
    medium?: string;
  };
  bannerImage?: string;
  format?: string;
  episodes?: number;
  duration?: number;
  status?: string;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  averageScore?: number;
  popularity?: number;
  genres?: string[];
  studios?: {
    nodes?: { id: number; name: string }[];
  };
  characters?: {
    edges?: {
      role?: string;
      node?: {
        id: number;
        name?: { full?: string };
        image?: { medium?: string };
      };
    }[];
  };
}

export function mapAniListToMediaItem(raw: AniListMediaRaw): MediaItem {
  const displayTitle = raw.title.english || raw.title.romaji || raw.title.native || "Untitled Anime";
  const poster = raw.coverImage?.extraLarge || raw.coverImage?.large || raw.coverImage?.medium || null;
  const backdrop = raw.bannerImage || poster;
  const year = raw.startDate?.year;

  // Clean description of HTML tags
  const cleanOverview = raw.description
    ? raw.description.replace(/<[^>]*>?/gm, "").trim()
    : "No overview available.";

  const genres: Genre[] = (raw.genres || []).map((g) => ({
    id: g.toLowerCase(),
    name: g,
  }));

  const cast: CastMember[] = (raw.characters?.edges || []).map((edge, index) => ({
    id: `char-${edge.node?.id || index}`,
    name: edge.node?.name?.full || "Unknown Character",
    character: edge.role || "Main",
    profileImage: edge.node?.image?.medium || null,
    order: index,
  }));

  const totalEps = raw.episodes || 12;
  const mockEpisodes: Episode[] = Array.from({ length: totalEps }).map((_, i) => {
    const epNum = i + 1;
    return {
      id: `anilist-${raw.id}-ep-${epNum}`,
      seriesId: `anilist-${raw.id}`,
      seasonNumber: 1,
      episodeNumber: epNum,
      title: `Episode ${epNum}`,
      overview: `Episode ${epNum} of ${displayTitle}.`,
      thumbnail: backdrop,
      runtime: raw.duration || 24,
      airDate: year ? `${year}-01-01` : undefined,
    };
  });

  const seasons: Season[] = [
    {
      id: `anilist-${raw.id}-s1`,
      seasonNumber: 1,
      title: "Season 1",
      episodeCount: totalEps,
      poster,
      episodes: mockEpisodes,
    },
  ];

  return {
    id: `anilist-${raw.id}`,
    externalIds: {
      anilistId: raw.id,
      malId: raw.idMal,
    },
    type: MediaType.ANIME,
    title: displayTitle,
    originalTitle: raw.title.romaji || raw.title.native,
    overview: cleanOverview,
    poster,
    backdrop,
    year,
    rating: raw.averageScore ? Number((raw.averageScore / 10).toFixed(1)) : undefined,
    voteCount: raw.popularity,
    genres,
    runtime: raw.duration || 24,
    status: raw.status,
    cast,
    studios: raw.studios?.nodes?.map((s) => ({ id: String(s.id), name: s.name })) || [],
    seasons,
    totalSeasons: 1,
    totalEpisodes: totalEps,
    provider: "anilist",
    providerMediaId: String(raw.id),
  };
}
