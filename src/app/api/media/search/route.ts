import { NextRequest, NextResponse } from "next/server";
import { mediaAggregator } from "@/providers/core/aggregator";
import { MediaType } from "@/providers/core/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") as MediaType | undefined;
  const genre = searchParams.get("genre") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  if (!query.trim() && !genre) {
    return NextResponse.json({ items: [], total: 0, page: 1, totalPages: 0 });
  }

  const result = await mediaAggregator.search(query, {
    type,
    genre,
    page: isNaN(page) ? 1 : page,
    limit: 24,
  });

  return NextResponse.json(result);
}
