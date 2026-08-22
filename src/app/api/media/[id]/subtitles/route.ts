import { NextResponse } from "next/server";
import { MOCK_SUBTITLES } from "@/providers/mock/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ subtitles: MOCK_SUBTITLES });
}
