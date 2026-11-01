import fs from "fs/promises";
import path from "path";
import { PODCASTS_DIR, validArticleSlug } from "@/lib/article-loader";

const MIME: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
};

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; path: string[] }> }) {
  const { slug, path: segments } = await params;
  if (!validArticleSlug(slug) || segments.some(segment => segment.startsWith(".") || /[/\\]/.test(segment))) {
    return new Response("Not found", { status: 404 });
  }
  const root = path.join(PODCASTS_DIR, slug, "attachments");
  try {
    const file = await fs.realpath(path.join(root, ...segments));
    // Resolve symlinks too; never serve neighboring content or article sources.
    if (!file.startsWith(root + path.sep) || !MIME[path.extname(file).toLowerCase()]) return new Response("Not found", { status: 404 });
    return new Response(await fs.readFile(file), {
      headers: {
        "Content-Type": MIME[path.extname(file).toLowerCase()],
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch (error) {
    if (["ENOENT", "ENOTDIR", "EISDIR"].includes((error as NodeJS.ErrnoException).code || "")) return new Response("Not found", { status: 404 });
    throw error;
  }
}
