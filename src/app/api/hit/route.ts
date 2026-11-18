import fs from "fs/promises";
import path from "path";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { appendHit, type Hit } from "@/lib/hit-store";
import { clientIp } from "@/lib/stats-auth";
import { PODCASTS_DIR, validArticleSlug } from "@/lib/article-loader";

const MAX_BODY_BYTES = 1024;
const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|httpclient|facebookexternalhit|embedly/i;

// Rate limits (fixed windows, in memory). Per IP covers one noisy client,
// the global one bounds what a client rotating IPs can write.
const WINDOW_MS = 60 * 60 * 1000;
const PER_IP_LIMIT = 300;
const GLOBAL_LIMIT = 5000;
const perIp = new Map<string, number>();
let globalCount = 0;
let windowEndsAt = 0;

function allow(ip: string): boolean {
  const now = Date.now();
  if (now >= windowEndsAt) {
    perIp.clear();
    globalCount = 0;
    windowEndsAt = now + WINDOW_MS;
  }
  const count = perIp.get(ip) ?? 0;
  if (count >= PER_IP_LIMIT || globalCount >= GLOBAL_LIMIT) return false;
  perIp.set(ip, count + 1);
  globalCount++;
  return true;
}

// The salt lives only in memory and changes every day, so stored visitor
// hashes cannot be turned back into IPs, nor linked across days.
let salt = { day: "", value: "" };
function visitorHash(ip: string, ua: string, day: string): string {
  if (salt.day !== day) salt = { day, value: randomBytes(32).toString("hex") };
  return createHash("sha256").update(`${salt.value}|${ip}|${ua}`).digest("hex").slice(0, 16);
}

const DECKS_DIR = path.join(process.cwd(), "decks");
const exists = (file: string) => fs.access(file).then(() => true, () => false);

/** Only real pages are counted, so junk paths cannot pollute the stats. */
async function isTrackedPath(p: string): Promise<boolean> {
  if (p === "/" || p === "/join") return true;
  const match = /^\/(deck|podcast)\/([^/]+)$/.exec(p);
  if (!match || !validArticleSlug(match[2])) return false;
  return match[1] === "deck"
    ? exists(path.join(DECKS_DIR, match[2], "deck.md"))
    : exists(path.join(PODCASTS_DIR, match[2], "article.md"));
}

function device(ua: string): Hit["dev"] {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

function browser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios|chromium/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function referrerHost(ref: unknown, ownHost: string | null): string | undefined {
  if (typeof ref !== "string" || !ref) return undefined;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (!host || host === ownHost?.split(":")[0].replace(/^www\./, "")) return undefined;
    return host.slice(0, 100);
  } catch {
    return undefined;
  }
}

const done = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return done();
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  // sendBeacon posts text/plain, so parse the text ourselves.
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!body || typeof body !== "object") return new NextResponse(null, { status: 400 });

  const { type, path: pagePath, pv } = body;
  if (
    (type !== "view" && type !== "slide") ||
    typeof pagePath !== "string" ||
    pagePath.length > 200 ||
    typeof pv !== "string" ||
    !/^[a-z0-9]{8,32}$/i.test(pv)
  ) {
    return new NextResponse(null, { status: 400 });
  }

  const ip = clientIp(request.headers);
  if (!allow(ip)) return new NextResponse(null, { status: 429 });
  if (!(await isTrackedPath(pagePath))) return done();

  const now = new Date();
  const hit: Hit = {
    t: now.toISOString(),
    type,
    path: pagePath,
    pv,
    v: visitorHash(ip, ua, now.toISOString().slice(0, 10)),
  };

  if (type === "view") {
    hit.ref = referrerHost(body.ref, request.headers.get("host"));
    hit.dev = device(ua);
    hit.br = browser(ua);
  } else {
    const slide = Number(body.slide);
    const total = Number(body.total);
    if (
      !pagePath.startsWith("/deck/") ||
      !Number.isInteger(slide) ||
      !Number.isInteger(total) ||
      total < 1 ||
      total > 1000 ||
      slide < 1 ||
      slide > total
    ) {
      return new NextResponse(null, { status: 400 });
    }
    hit.slide = slide;
    hit.total = total;
  }

  await appendHit(hit);
  return done();
}
