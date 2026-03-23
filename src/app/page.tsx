import Link from "next/link";
import { listDecks } from "@/lib/deck-loader";

export default async function HomePage() {
  const decks = await listDecks();

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--surface-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div
          className="mb-4"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            letterSpacing: "var(--tracking-widest)",
            textTransform: "uppercase" as const,
            color: "var(--text-muted)",
          }}
        >
          Presentations
        </div>

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
            Deck Creator.
          </h1>
          <p
            style={{
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-relaxed)",
              color: "var(--text-secondary)",
            }}
          >
            Presentations from Markdown. Create, present, export to PDF.
          </p>
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
          <div className="space-y-3">
            {decks.map((deck, index) => (
              <Link
                key={deck.slug}
                href={`/deck/${deck.slug}`}
                className="block group"
              >
                <div className="card">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="accent-badge">
                      {String(index + 1).padStart(2, "0")}
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
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
