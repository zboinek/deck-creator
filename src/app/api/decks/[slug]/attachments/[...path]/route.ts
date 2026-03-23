import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

interface RouteParams {
  params: Promise<{ slug: string; path: string[] }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug, path: segments } = await params;

  const filePath = path.join(
    process.cwd(),
    "decks",
    slug,
    "attachments",
    ...segments
  );

  const resolved = path.resolve(filePath);
  const allowedRoot = path.resolve(
    path.join(process.cwd(), "decks", slug, "attachments")
  );
  if (!resolved.startsWith(allowedRoot)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
