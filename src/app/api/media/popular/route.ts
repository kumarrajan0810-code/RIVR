import { NextRequest, NextResponse } from "next/server";
import { mediaAggregator } from "@/providers/core/aggregator";
import { MediaType } from "@/providers/core/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as MediaType | undefined;

  const items = await mediaAggregator.getPopular(type);
  return NextResponse.json({ items });
}
