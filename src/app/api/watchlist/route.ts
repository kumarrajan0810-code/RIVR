import { NextResponse } from "next/server";
import { MOCK_WATCHLIST } from "@/providers/mock/data";

export async function GET() {
  return NextResponse.json({ watchlist: MOCK_WATCHLIST });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, item: body });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  return NextResponse.json({ success: true, deletedId: id });
}
