import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/providers/tmdb/client";
import { STAR_POWER_LIST, type StarPerson } from "@/lib/stars";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  try {
    if (query && query.length > 0) {
      // Live search across TMDB for any actor or director in the world
      const results = await tmdbClient.searchPerson(query);
      if (results.length > 0) {
        return NextResponse.json({ stars: results });
      }
    }

    // Default: Return curated stars + live popular persons
    const popular = await tmdbClient.getPopularPersons(1);
    const combined = [...STAR_POWER_LIST];

    popular.forEach((p) => {
      if (!combined.some((c) => c.tmdbId === p.tmdbId)) {
        combined.push(p as StarPerson);
      }
    });

    return NextResponse.json({
      stars: combined,
    });
  } catch (err) {
    console.error("Error fetching stars:", err);
    return NextResponse.json({
      stars: STAR_POWER_LIST,
    });
  }
}
