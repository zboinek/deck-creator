import type { Hit } from "./hit-store";

export interface PageRow {
  path: string;
  views: number;
  visitors: number;
  lastView: string;
  /** Deck pages only: average furthest slide as a share of the deck, 0–1. */
  avgDepth?: number;
  /** Deck pages only: share of views that reached the last slide, 0–1. */
  completion?: number;
}

export interface Report {
  from: string | null;
  views: number;
  visitors: number;
  visitorsToday: number;
  viewsToday: number;
  days: { day: string; views: number; visitors: number }[];
  pages: PageRow[];
  referrers: { host: string; views: number }[];
  devices: { name: string; views: number }[];
  browsers: { name: string; views: number }[];
}

const dayOf = (t: string) => t.slice(0, 10);

const ranked = (counts: Map<string, number>, limit: number) =>
  [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit);

const bump = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);

/**
 * Visitor hashes change every day, so "visitors" here is the sum of daily
 * unique visitors: someone who comes back on three days counts three times.
 */
export function buildReport(hits: Hit[], days: number | null, now = new Date()): Report {
  const today = dayOf(now.toISOString());
  let from: string | null = null;
  if (days !== null) {
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    from = dayOf(start.toISOString());
  }
  const inRange = from ? hits.filter((h) => dayOf(h.t) >= from) : hits;

  const views = inRange.filter((h) => h.type === "view");
  const dailyVisitors = new Set<string>();
  const perDay = new Map<string, { views: number; visitors: Set<string> }>();
  const perPage = new Map<string, { views: number; visitors: Set<string>; last: string }>();
  const referrers = new Map<string, number>();
  const devices = new Map<string, number>();
  const browsers = new Map<string, number>();

  for (const h of views) {
    const day = dayOf(h.t);
    dailyVisitors.add(`${day}|${h.v}`);

    const d = perDay.get(day) ?? { views: 0, visitors: new Set<string>() };
    d.views++;
    d.visitors.add(h.v);
    perDay.set(day, d);

    const p = perPage.get(h.path) ?? { views: 0, visitors: new Set<string>(), last: h.t };
    p.views++;
    p.visitors.add(`${day}|${h.v}`);
    if (h.t > p.last) p.last = h.t;
    perPage.set(h.path, p);

    bump(referrers, h.ref || "(direct)");
    if (h.dev) bump(devices, h.dev);
    if (h.br) bump(browsers, h.br);
  }

  // Deck depth: furthest slide per page view.
  const furthest = new Map<string, { path: string; slide: number; total: number }>();
  for (const h of inRange) {
    if (h.type !== "slide" || !h.slide || !h.total) continue;
    const prev = furthest.get(h.pv);
    if (!prev || h.slide > prev.slide) furthest.set(h.pv, { path: h.path, slide: h.slide, total: h.total });
  }
  const depth = new Map<string, { sum: number; done: number; n: number }>();
  for (const f of furthest.values()) {
    const d = depth.get(f.path) ?? { sum: 0, done: 0, n: 0 };
    d.sum += f.slide / f.total;
    if (f.slide >= f.total) d.done++;
    d.n++;
    depth.set(f.path, d);
  }

  // Continuous day axis, including days without traffic.
  const dayRows: Report["days"] = [];
  const firstDay = from ?? [...perDay.keys()].sort()[0] ?? today;
  for (let d = new Date(`${firstDay}T00:00:00Z`); dayOf(d.toISOString()) <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = dayOf(d.toISOString());
    const row = perDay.get(key);
    dayRows.push({ day: key, views: row?.views ?? 0, visitors: row?.visitors.size ?? 0 });
  }

  const todayRow = perDay.get(today);

  return {
    from,
    views: views.length,
    visitors: dailyVisitors.size,
    viewsToday: todayRow?.views ?? 0,
    visitorsToday: todayRow?.visitors.size ?? 0,
    days: dayRows,
    pages: [...perPage]
      .map(([path, p]) => {
        const d = depth.get(path);
        return {
          path,
          views: p.views,
          visitors: p.visitors.size,
          lastView: p.last,
          avgDepth: d ? d.sum / d.n : undefined,
          completion: d ? d.done / d.n : undefined,
        };
      })
      .sort((a, b) => b.views - a.views),
    referrers: ranked(referrers, 15).map(([host, views]) => ({ host, views })),
    devices: ranked(devices, 5).map(([name, views]) => ({ name, views })),
    browsers: ranked(browsers, 8).map(([name, views]) => ({ name, views })),
  };
}
