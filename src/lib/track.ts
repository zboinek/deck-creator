"use client";

/*
 * Cookieless page-view tracking. A page load gets a random id that lives only
 * in memory; nothing is stored in the browser. Bots that do not run
 * JavaScript and Next.js prefetches never reach this code.
 */

let currentPath: string | null = null;
let currentId = "";
let viewSent = false;
let maxSlide = 0;
let firstView = true;

function newId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20);
}

/** Same id for every event of one page view; a new path starts a new view. */
function enter(path: string) {
  if (path !== currentPath) {
    currentPath = path;
    currentId = newId();
    viewSent = false;
    maxSlide = 0;
  }
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.("/api/hit", body)) return;
  } catch {
    // fall through to fetch
  }
  fetch("/api/hit", { method: "POST", body, keepalive: true }).catch(() => {});
}

export function trackView(path: string) {
  if (path.startsWith("/stats")) return;
  enter(path);
  if (viewSent) return;
  viewSent = true;
  // document.referrer is only meaningful for the first page of a visit.
  send({ type: "view", path, pv: currentId, ref: firstView ? document.referrer : undefined });
  firstView = false;
}

/** Reports the furthest slide reached in the current view (1-based). */
export function trackSlide(path: string, slide: number, total: number) {
  enter(path);
  if (slide <= maxSlide) return;
  maxSlide = slide;
  send({ type: "slide", path, pv: currentId, slide, total });
}
