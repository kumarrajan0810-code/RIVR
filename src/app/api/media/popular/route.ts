import { NextRequest, NextResponse } from "next/server";
import { mediaAggregator } from "@/providers/core/aggregator";
import { MediaType } from "@/providers/core/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as MediaType | undefined;
  const genre = searchParams.get("genre") ?? undefined;
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : undefined;

  if (genre || year) {
    const searchRes = await mediaAggregator.search("", {
      type,
      genre,
      year: !isNaN(year as number) ? year : undefined,
      limit: 24,
    });
    return NextResponse.json({ items: searchRes.items });
  }

  const items = await mediaAggregator.getPopular(type);
  return NextResponse.json({ items });
}
