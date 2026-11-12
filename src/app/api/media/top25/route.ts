import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/providers/tmdb/client";
import { aniListClient } from "@/providers/anilist/client";
import {
  TOP25_MOVIES_DATA,
  TOP25_DRAMAS_DATA,
  TOP25_ANIME_DATA,
} from "@/providers/mock/top25Data";
import type { MediaItem } from "@/providers/core/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") || "movies") as "movies" | "anime" | "dramas";
  const window = (searchParams.get("window") || "daily") as "daily" | "weekly" | "monthly" | "all-time";

  try {
    let items: MediaItem[] = [];

    if (category === "anime") {
      const live = await aniListClient.getTop25Anime(window);
      const validLive = live.filter((i) => i.poster);
      items = validLive.length >= 10 ? validLive : TOP25_ANIME_DATA;
    } else if (category === "dramas") {
      const live = await tmdbClient.getTop25Dramas(window);
      const validLive = live.filter((i) => i.poster);
      items = validLive.length >= 10 ? validLive : TOP25_DRAMAS_DATA;
    } else {
      // movies
      const live = await tmdbClient.getTop25Movies(window);
      const validLive = live.filter((i) => i.poster);
      items = validLive.length >= 10 ? validLive : TOP25_MOVIES_DATA;
    }

    return NextResponse.json({
      category,
      window,
      total: items.length,
      items: items.slice(0, 25),
    });
  } catch (err) {
    console.error("Top 25 fetch error:", err);
    let fallback = TOP25_MOVIES_DATA;
    if (category === "anime") fallback = TOP25_ANIME_DATA;
    if (category === "dramas") fallback = TOP25_DRAMAS_DATA;

    return NextResponse.json({
      category,
      window,
      total: fallback.length,
      items: fallback.slice(0, 25),
    });
  }
}
