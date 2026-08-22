import { NextResponse } from "next/server";
import { mediaAggregator } from "@/providers/core/aggregator";
import { MOCK_EPISODES } from "@/providers/mock/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const season = parseInt(searchParams.get("season") ?? "1", 10);
  const seasonNum = isNaN(season) ? 1 : season;

  // 1. Live providers (TMDB / AniList)
  try {
    const liveEpisodes = await mediaAggregator.getEpisodes(id, seasonNum);
    if (liveEpisodes && liveEpisodes.length > 0) {
      return NextResponse.json({ episodes: liveEpisodes });
    }
  } catch (err) {
    console.warn(`Error fetching live episodes for ${id}:`, err);
  }

  // 2. Fallback to mock
  const key = `${id}:${seasonNum}`;
  const episodes = MOCK_EPISODES[key] ?? [];
  return NextResponse.json({ episodes });
}
