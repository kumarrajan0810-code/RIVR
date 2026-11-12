import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/providers/tmdb/client";
import { aniListClient } from "@/providers/anilist/client";
import {
  REAL_UPCOMING_MOVIES,
  REAL_UPCOMING_DRAMAS,
  REAL_UPCOMING_ANIME,
} from "@/providers/mock/upcomingData";
import type { MediaItem } from "@/providers/core/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "all") as "all" | "movie" | "series" | "anime" | "drama";
  const todayStr = new Date().toISOString().split("T")[0];

  try {
    let items: MediaItem[] = [];

    if (type === "movie") {
      const live = await tmdbClient.getUpcomingMovies();
      // Strictly filter to ensure release date is today or in the future
      const validLive = live.filter((m) => m.releaseDate && m.releaseDate >= todayStr && m.poster);
      items = validLive.length > 0 ? validLive : REAL_UPCOMING_MOVIES;
    } else if (type === "drama") {
      const live = await tmdbClient.getUpcomingTV(true);
      const validLive = live.filter((m) => m.releaseDate && m.releaseDate >= todayStr && m.poster);
      items = validLive.length > 0 ? validLive : REAL_UPCOMING_DRAMAS;
    } else if (type === "series") {
      const live = await tmdbClient.getUpcomingTV(false);
      const validLive = live.filter((m) => m.releaseDate && m.releaseDate >= todayStr && m.poster);
      items = validLive.length > 0 ? validLive : REAL_UPCOMING_DRAMAS;
    } else if (type === "anime") {
      const live = await aniListClient.getUpcomingAnime();
      const validLive = live.filter((m) => m.poster);
      items = validLive.length > 0 ? validLive : REAL_UPCOMING_ANIME;
    } else {
      // all
      const [liveMovies, liveDramas, liveAnime] = await Promise.all([
        tmdbClient.getUpcomingMovies(),
        tmdbClient.getUpcomingTV(true),
        aniListClient.getUpcomingAnime(),
      ]);

      const validMovies = liveMovies.filter((m) => m.releaseDate && m.releaseDate >= todayStr && m.poster);
      const validDramas = liveDramas.filter((m) => m.releaseDate && m.releaseDate >= todayStr && m.poster);
      const validAnime = liveAnime.filter((m) => m.poster);

      const finalMovies = validMovies.length > 0 ? validMovies : REAL_UPCOMING_MOVIES;
      const finalDramas = validDramas.length > 0 ? validDramas : REAL_UPCOMING_DRAMAS;
      const finalAnime = validAnime.length > 0 ? validAnime : REAL_UPCOMING_ANIME;

      items = [
        ...finalMovies.slice(0, 5),
        ...finalDramas.slice(0, 5),
        ...finalAnime.slice(0, 5),
      ];
    }

    return NextResponse.json({
      type,
      total: items.length,
      items,
    });
  } catch (err) {
    console.error("Upcoming fetch error:", err);
    let fallback = [...REAL_UPCOMING_MOVIES.slice(0, 4), ...REAL_UPCOMING_DRAMAS.slice(0, 3), ...REAL_UPCOMING_ANIME.slice(0, 3)];
    if (type === "movie") fallback = REAL_UPCOMING_MOVIES;
    if (type === "drama" || type === "series") fallback = REAL_UPCOMING_DRAMAS;
    if (type === "anime") fallback = REAL_UPCOMING_ANIME;

    return NextResponse.json({
      type,
      total: fallback.length,
      items: fallback,
    });
  }
}
