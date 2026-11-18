import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isStatsAuthorized } from "@/lib/stats-auth";
import { readHits } from "@/lib/hit-store";
import { buildReport } from "@/lib/stats-report";
import { listDecks } from "@/lib/deck-loader";
import { listPodcasts } from "@/lib/article-loader";
import "./stats.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats",
  robots: { index: false, follow: false },
};

const RANGES = [
  { key: "7", label: "7 days", days: 7 },
  { key: "30", label: "30 days", days: 30 },
  { key: "90", label: "90 days", days: 90 },
  { key: "all", label: "All time", days: null },
] as const;

const pct = (x: number | undefined) => (x === undefined ? "–" : `${Math.round(x * 100)}%`);
const num = (n: number) => n.toLocaleString("en-US");
const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // The proxy already asks for the password; checking again here means a
  // matcher change can never expose this page by accident.
  if (!isStatsAuthorized((await headers()).get("authorization"))) notFound();

  const { range: rangeParam } = await searchParams;
  const range = RANGES.find((r) => r.key === rangeParam) ?? RANGES[1];

  const [hits, decks, podcasts] = await Promise.all([readHits(), listDecks(), listPodcasts()]);
  const report = buildReport(hits, range.days);

  const titles = new Map<string, string>([
    ["/", "Home page"],
    ["/join", "Join a live session"],
  ]);
  for (const d of decks) titles.set(`/deck/${d.slug}`, String(d.meta.title ?? d.slug));
  for (const p of podcasts) titles.set(`/podcast/${p.slug}`, String(p.meta.title ?? p.slug));

  const maxDay = Math.max(1, ...report.days.map((d) => d.views));
  const deviceTotal = report.devices.reduce((s, d) => s + d.views, 0) || 1;
  const browserTotal = report.browsers.reduce((s, d) => s + d.views, 0) || 1;

  return (
    <main className="stats">
      <header className="stats-head">
        <div>
          <div className="stats-kicker">Deck Creator</div>
          <h1>Visits</h1>
        </div>
        <nav className="stats-ranges" aria-label="Time range">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/stats?range=${r.key}`}
              className={r.key === range.key ? "active" : undefined}
              aria-current={r.key === range.key ? "page" : undefined}
            >
              {r.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="stats-tiles">
        <Tile label="Page views" value={num(report.views)} />
        <Tile label="Visitors" value={num(report.visitors)} hint="unique per day" />
        <Tile label="Views today" value={num(report.viewsToday)} />
        <Tile label="Visitors today" value={num(report.visitorsToday)} />
      </section>

      <section className="stats-card">
        <h2>Views per day</h2>
        {report.views === 0 ? (
          <p className="stats-empty">No visits in this range yet.</p>
        ) : (
          <>
            <div className="stats-bars" role="img" aria-label="Page views per day">
              {report.days.map((d) => (
                <div
                  key={d.day}
                  className="stats-bar"
                  style={{ height: `${(d.views / maxDay) * 100}%` }}
                  title={`${d.day}: ${d.views} views, ${d.visitors} visitors`}
                />
              ))}
            </div>
            <div className="stats-axis">
              <span>{report.days[0]?.day}</span>
              <span>{report.days[report.days.length - 1]?.day}</span>
            </div>
          </>
        )}
      </section>

      <section className="stats-card">
        <h2>Pages</h2>
        {report.pages.length === 0 ? (
          <p className="stats-empty">No pages opened in this range.</p>
        ) : (
          <div className="stats-scroll">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th className="num">Views</th>
                  <th className="num">Visitors</th>
                  <th className="num" title="Average furthest slide, as a share of the deck">Read depth</th>
                  <th className="num" title="Views that reached the last slide">Finished</th>
                  <th className="num">Last view</th>
                </tr>
              </thead>
              <tbody>
                {report.pages.map((p) => (
                  <tr key={p.path}>
                    <td>
                      <div className="stats-title">{titles.get(p.path) ?? p.path}</div>
                      <div className="stats-path">{p.path}</div>
                    </td>
                    <td className="num">{num(p.views)}</td>
                    <td className="num">{num(p.visitors)}</td>
                    <td className="num">{pct(p.avgDepth)}</td>
                    <td className="num">{pct(p.completion)}</td>
                    <td className="num nowrap">{dateTime(p.lastView)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="stats-grid">
        <section className="stats-card">
          <h2>Where visitors came from</h2>
          <List rows={report.referrers.map((r) => ({ name: r.host, value: num(r.views) }))} />
        </section>
        <section className="stats-card">
          <h2>Devices</h2>
          <List rows={report.devices.map((d) => ({ name: d.name, value: pct(d.views / deviceTotal) }))} />
          <h2 className="stats-sub">Browsers</h2>
          <List rows={report.browsers.map((b) => ({ name: b.name, value: pct(b.views / browserTotal) }))} />
        </section>
      </div>

      <p className="stats-note">
        No cookies and no IP addresses are stored. A visitor is recognised by a hash that changes every day,
        so someone who comes back on three days counts as three visitors. Bots and PDF exports are not counted.
      </p>
    </main>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stats-tile">
      <div className="stats-tile-label">{label}</div>
      <div className="stats-tile-value">{value}</div>
      {hint ? <div className="stats-tile-hint">{hint}</div> : null}
    </div>
  );
}

function List({ rows }: { rows: { name: string; value: string }[] }) {
  if (rows.length === 0) return <p className="stats-empty">No data yet.</p>;
  return (
    <ul className="stats-list">
      {rows.map((r) => (
        <li key={r.name}>
          <span>{r.name}</span>
          <span className="num">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}
