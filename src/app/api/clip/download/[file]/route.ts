import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.CLIP_BACKEND_URL ?? "https://bss-yt-downloader.fly.dev";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const res = await fetch(`${BACKEND}/api/clip/download/${file}`);
  if (!res.ok) {
    return NextResponse.json({ error: "File not found or expired" }, { status: res.status });
  }
  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type":        "video/mp4",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? `attachment; filename="${file}"`,
      "Cache-Control":       "private, no-cache",
    },
  });
}