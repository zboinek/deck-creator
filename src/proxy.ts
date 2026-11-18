import { NextResponse, type NextRequest } from "next/server";
import { clientIp, isStatsAuthorized, statsEnabled } from "@/lib/stats-auth";

// Brute-force brake: after MAX_FAILURES wrong logins an IP waits out the window.
const MAX_FAILURES = 10;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

function tooManyFailures(ip: string, now: number): boolean {
  const entry = failures.get(ip);
  return !!entry && entry.resetAt > now && entry.count >= MAX_FAILURES;
}

function recordFailure(ip: string, now: number) {
  const entry = failures.get(ip);
  if (!entry || entry.resetAt <= now) {
    if (failures.size > 10_000) {
      for (const [key, value] of failures) if (value.resetAt <= now) failures.delete(key);
    }
    failures.set(ip, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
  } else {
    entry.count++;
  }
}

export function proxy(request: NextRequest) {
  // No password configured: behave as if the page does not exist.
  if (!statsEnabled()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ip = clientIp(request.headers);
  const now = Date.now();
  if (tooManyFailures(ip, now)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(FAILURE_WINDOW_MS / 1000)) },
    });
  }

  if (!isStatsAuthorized(request.headers.get("authorization"))) {
    if (request.headers.has("authorization")) recordFailure(ip, now);
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="stats", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/stats", "/stats/:path*"],
};
