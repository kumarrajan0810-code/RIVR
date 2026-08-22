import { NextResponse } from "next/server";
import { mediaAggregator } from "@/providers/core/aggregator";
import { getMediaById } from "@/providers/mock/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. AniList
  if (id.startsWith("anilist-")) {
    const item = await mediaAggregator.getSeries(id, "anilist");
    if (item) return NextResponse.json(item);
  }

  // 2. TMDB TV
  if (id.startsWith("tmdb-tv-")) {
    const item = await mediaAggregator.getSeries(id, "tmdb");
    if (item) return NextResponse.json(item);
  }

  // 3. TMDB Movie
  if (id.startsWith("tmdb-movie-")) {
    const item = await mediaAggregator.getMovie(id, "tmdb");
    if (item) return NextResponse.json(item);
  }

  // 4. Mock / General fallback
  const mockItem = getMediaById(id);
  if (mockItem) {
    return NextResponse.json(mockItem);
  }

  return NextResponse.json({ error: "Media item not found" }, { status: 404 });
}
