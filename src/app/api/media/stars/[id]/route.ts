import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/providers/tmdb/client";
import { STAR_POWER_LIST } from "../route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Find in predefined list or parse TMDB ID
  let star = STAR_POWER_LIST.find((s) => s.id === id || String(s.tmdbId) === id);
  let tmdbId = star ? star.tmdbId : parseInt(id.replace("tmdb-person-", "").replace("star-", ""), 10);

  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: "Invalid star ID" }, { status: 404 });
  }

  try {
    const details = await tmdbClient.getPersonDetails(tmdbId);
    if (!details) {
      return NextResponse.json({ error: "Star not found in TMDB" }, { status: 404 });
    }

    return NextResponse.json({
      star: {
        id: star?.id || `star-${details.id}`,
        tmdbId: details.id,
        name: details.name,
        biography: details.biography,
        birthday: details.birthday,
        placeOfBirth: details.placeOfBirth,
        profileImage: details.profilePath || star?.image,
        role: details.isDirector ? "FROM" : "FEATURING",
        knownFor: details.knownForDepartment,
        isDirector: details.isDirector,
      },
      directed: details.directed,
      starred: details.cast,
    });
  } catch (err) {
    console.error("Error fetching star details:", err);
    return NextResponse.json({ error: "Failed to fetch star details" }, { status: 500 });
  }
}
