import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.CLIP_BACKEND_URL ?? "https://bss-yt-downloader.fly.dev";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res  = await fetch(`${BACKEND}/api/clip/price`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}