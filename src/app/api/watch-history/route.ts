import { NextResponse } from "next/server";
import { MOCK_WATCH_PROGRESS } from "@/providers/mock/data";

export async function GET() {
  return NextResponse.json({ history: MOCK_WATCH_PROGRESS });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, progress: body });
}
