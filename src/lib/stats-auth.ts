import { createHash, timingSafeEqual } from "node:crypto";

/** Shorter passwords are treated as unset, so /stats stays closed (404). */
export const MIN_STATS_PASSWORD_LENGTH = 12;

export function statsEnabled(): boolean {
  return (process.env.STATS_PASSWORD ?? "").length >= MIN_STATS_PASSWORD_LENGTH;
}

const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();

/** Checks an `Authorization: Basic ...` header against STATS_USER / STATS_PASSWORD. */
export function isStatsAuthorized(authorization: string | null): boolean {
  if (!statsEnabled() || !authorization?.startsWith("Basic ")) return false;

  let supplied: string;
  try {
    supplied = Buffer.from(authorization.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }
  const expected = `${process.env.STATS_USER || "admin"}:${process.env.STATS_PASSWORD}`;
  // Comparing fixed-length digests keeps the check constant-time regardless of input length.
  return timingSafeEqual(digest(supplied), digest(expected));
}

/**
 * Client IP as seen by the reverse proxy in front of the app. The last
 * X-Forwarded-For entry is the one our own proxy appended; earlier entries
 * come from the client and can be forged.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
