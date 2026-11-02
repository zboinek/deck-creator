import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { listDecks, type DeckSummary } from "@/lib/deck-loader";
import { listPodcasts } from "@/lib/article-loader";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const KICKER_STYLE = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-xs)",
  fontWeight: 500,
  letterSpacing: "var(--tracking-widest)",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
};

function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={KICKER_STYLE}>
      {children}
    </div>
  );
}

export default async function HomePage() {
  const [decks, podcasts] = await Promise.all([listDecks(), listPodcasts()]);

  const sections: { category: string | null; decks: DeckSummary[] }[] = [];
  for (const deck of decks) {
    const raw = deck.meta.category;
    const category = typeof raw === "string" && raw.trim() ? raw.trim() : null;
    if (category === null) {
      const last = sections[sections.length - 1];
      if (last && last.category === null) {
        last.decks.push(deck);
      } else {
        sections.push({ category: null, decks: [deck] });
      }
      continue;
    }
    const existing = sections.find((s) => s.category === category);
    if (existing) {
      existing.decks.push(deck);
    } else {
      sections.push({ category, decks: [deck] });
    }
  }
  const uncategorized = sections.find((s) => s.category === null);
  const grouped = [
    ...sections.filter((s) => s.category !== null),
    ...(uncategorized ? [uncategorized] : []),
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--surface-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Kicker className="mb-4">Prezentacje · Podcasty · Artykuły</Kicker>

        <header className="mb-14">
          <h1
            className="mb-3"
            style={{
              fontSize: "var(--text-5xl)",
              fontWeight: 700,
              letterSpacing: "var(--tracking-tighter)",
              lineHeight: "var(--leading-tight)",
              color: "var(--text-primary)",
            }}
          >
            Materiały edukacyjne Jakuba Zboiny.
          </h1>
          <p
            style={{
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-relaxed)",
              color: "var(--text-secondary)",
            }}
          >
            Prezentacje, podcasty i artykuły w jednym miejscu.
          </p>

          <div className="mt-6">
            <Link
              href="/join"
              className="join-session-link"
            >
              Join a live session &rarr;
            </Link>
          </div>
        </header>

        {decks.length === 0 ? (
          <div className="text-center py-20">
            <p
              className="mb-4"
              style={{
                fontSize: "var(--text-lg)",
                color: "var(--text-muted)",
              }}
            >
              No decks found.
            </p>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
              }}
            >
              Create a folder in{" "}
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  background: "var(--code-inline-bg)",
                  color: "var(--code-inline-text)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                /decks/your-deck-name/
              </code>{" "}
              with a{" "}
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  background: "var(--code-inline-bg)",
                  color: "var(--code-inline-text)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                deck.md
              </code>{" "}
              file to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map((section) => (
              <section key={section.category ?? "uncategorized"}>
                {section.category && <Kicker>{section.category}</Kicker>}
                <div className="mt-3 space-y-3">
                  {section.category === "AI3" && (
                    <>
                      {podcasts.map(({ slug, meta }) => (
                        <Link key={slug} href={`/podcast/${slug}`} className="block group">
                          <div className="card podcast-card">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="accent-badge podcast-card-icon" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
                                  <rect x="3" y="12" width="4" height="8" rx="2" />
                                  <rect x="17" y="12" width="4" height="8" rx="2" />
                                </svg>
                              </span>
                              <h2 className="podcast-card-title">{meta.title}</h2>
                            </div>
                            <p className="podcast-card-description line-clamp-2">
                              <strong>PODCAST · Podsumowanie cyklu AI3</strong> — {meta.description || "Posłuchaj nagrania i przeczytaj artykuł."}
                            </p>
                            <div className="podcast-card-meta flex flex-wrap items-center gap-2">
                              <span className="pill pill--podcast">Podcast · audio + artykuł</span>
                              {meta.date && <time dateTime={meta.date}>{meta.date}</time>}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                  {section.decks.map((deck, index) => (
                    <Link
                      key={deck.slug}
                      href={`/deck/${deck.slug}`}
                      className="block group"
                    >
                      <div className="card">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="accent-badge">
                            {String(section.decks.length - index).padStart(2, "0")}
                          </span>
                          <h2
                            style={{
                              fontSize: "var(--text-lg)",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              letterSpacing: "var(--tracking-tight)",
                              transition: "color var(--transition-fast)",
                            }}
                          >
                            <span className="group-hover:text-[#52525b] transition-colors">
                              {deck.meta.title}
                            </span>
                          </h2>
                        </div>

                        {deck.meta.description && (
                          <p
                            className="line-clamp-2"
                            style={{
                              fontSize: "var(--text-sm)",
                              color: "var(--text-secondary)",
                              lineHeight: "var(--leading-relaxed)",
                              marginLeft: "46px",
                              marginTop: "var(--space-1)",
                            }}
                          >
                            {deck.meta.description}
                          </p>
                        )}

                        <div
                          className="flex items-center gap-2"
                          style={{
                            marginLeft: "46px",
                            marginTop: "var(--space-3)",
                            fontSize: "var(--text-xs)",
                            color: "var(--text-muted)",
                          }}
                        >
                          <span
                            className="pill"
                            style={{
                              padding: "4px 12px",
                              fontSize: "var(--text-xs)",
                            }}
                          >
                            {deck.slideCount} slides
                          </span>
                          {deck.meta.date && (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "var(--tracking-wide)",
                              }}
                            >
                              {String(deck.meta.date).slice(0, 10)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer
          className="mt-16 pt-8"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--text-muted)",
              lineHeight: "var(--leading-relaxed)",
            }}
          >
            Add decks by creating directories in{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
              }}
            >
              /decks/
            </code>{" "}
            with a{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
              }}
            >
              deck.md
            </code>{" "}
            file. Separate slides with{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
              }}
            >
              ---
            </code>
            . Set an optional{" "}
            <code
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
              }}
            >
              category
            </code>{" "}
            in frontmatter to group decks on this page.
          </p>
        </footer>
      </div>
    </div>
  );
}
