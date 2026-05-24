"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SlideShell } from "./SlideShell";
import { MarkdownSlide } from "./MarkdownSlide";
import { SessionControls } from "./SessionControls";
import { useSessionSync } from "@/hooks/useSessionSync";
import type { SessionRole } from "@/hooks/useSessionSync";
import type { ParsedSlide, DeckMeta } from "@/lib/deck-parser";

export type SlideTheme = "light" | "dark";

interface DeckPresentationProps {
  meta: DeckMeta;
  slides: ParsedSlide[];
  slug: string;
}

function ThemeToggle({ theme, onToggle }: { theme: SlideTheme; onToggle: () => void }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title="Toggle theme (T)"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <span
        className={`theme-toggle__option ${theme === "light" ? "theme-toggle__option--active" : ""}`}
        aria-hidden
      >
        &#9788;
      </span>
      <span
        className={`theme-toggle__option ${theme === "dark" ? "theme-toggle__option--active" : ""}`}
        aria-hidden
      >
        &#9790;
      </span>
    </button>
  );
}

/* ─── Slide Thumbnail (scaled miniature) ─── */
function SlideThumbnail({
  slide,
  slideNumber,
  total,
  slug,
  theme,
  isNext,
  onClick,
}: {
  slide: ParsedSlide;
  slideNumber: number;
  total: number;
  slug: string;
  theme: SlideTheme;
  isNext: boolean;
  onClick: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.15);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setScale(width / 1920);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`presenter-slide-thumb ${isNext ? "presenter-slide-thumb--next" : ""}`}
      onClick={onClick}
    >
      <div
        className="presenter-slide-thumb-inner"
        style={{ transform: `scale(${scale})` }}
      >
        <SlideShell current={slideNumber} total={total} theme={theme} heading={slide.heading}>
          <MarkdownSlide
            markdown={slide.markdown}
            slug={slug}
            layout={slide.layout}
            images={slide.images}
            textContent={slide.textContent}
            theme={theme}
            columns={slide.columns}
          />
        </SlideShell>
      </div>
      <span className="presenter-slide-thumb-number">{slideNumber}</span>
    </div>
  );
}

/* ─── Presenter View (Host with active session) ─── */
function PresenterView({
  slides,
  current,
  slug,
  theme,
  navigateSlide,
}: {
  slides: ParsedSlide[];
  current: number;
  slug: string;
  theme: SlideTheme;
  navigateSlide: (index: number) => void;
}) {
  const currentSlide = slides[current];
  const currentContainerRef = useRef<HTMLDivElement>(null);
  const [currentScale, setCurrentScale] = useState(0.5);

  useEffect(() => {
    const el = currentContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const scaleX = width / 1920;
      const scaleY = height / 1080;
      setCurrentScale(Math.min(scaleX, scaleY));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Get up to 2 next slides
  const upcomingSlides = slides.slice(current + 1, current + 3);

  return (
    <div className="presenter-layout">
      {/* Top: Current slide + Next slides 2x2 */}
      <div className="presenter-top">
        {/* Current slide */}
        <div className="presenter-current" ref={currentContainerRef}>
          <div
            className="presenter-current-inner"
            style={{
              width: 1920,
              height: 1080,
              transform: `scale(${currentScale})`,
            }}
          >
            <SlideShell
              current={current + 1}
              total={slides.length}
              theme={theme}
              heading={currentSlide.heading}
            >
              <MarkdownSlide
                markdown={currentSlide.markdown}
                slug={slug}
                layout={currentSlide.layout}
                images={currentSlide.images}
                textContent={currentSlide.textContent}
                theme={theme}
                columns={currentSlide.columns}
              />
            </SlideShell>
          </div>
        </div>

        {/* Next slides 2x2 grid */}
        <div className="presenter-upcoming-grid">
          {upcomingSlides.length > 0 ? (
            upcomingSlides.map((slide, i) => (
              <SlideThumbnail
                key={current + 1 + i}
                slide={slide}
                slideNumber={current + 2 + i}
                total={slides.length}
                slug={slug}
                theme={theme}
                isNext={i === 0}
                onClick={() => navigateSlide(current + 1 + i)}
              />
            ))
          ) : (
            <div className="presenter-no-upcoming">Last slide</div>
          )}
        </div>
      </div>

      {/* Bottom: Speaker notes full-width */}
      <div className="presenter-notes">
        <div className="presenter-notes-header">Speaker Notes</div>
        {currentSlide.speakerNotes ? (
          <div className="presenter-notes-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentSlide.speakerNotes}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="presenter-notes-empty">No notes for this slide</div>
        )}
      </div>
    </div>
  );
}

export function DeckPresentation({ meta, slides, slug }: DeckPresentationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isPrinting = searchParams.get("print") === "true";

  const sessionParam = searchParams.get("session");
  const roleParam = searchParams.get("role") as SessionRole | null;

  const [sessionCode, setSessionCode] = useState<string | null>(sessionParam);
  const [hostToken, setHostToken] = useState<string | null>(() => {
    if (typeof window === "undefined" || !sessionParam) return null;
    return sessionStorage.getItem(`session-token-${sessionParam}`);
  });

  const role: SessionRole = sessionCode
    ? roleParam === "display"
      ? "display"
      : roleParam === "host" || hostToken
        ? "host"
        : "follower"
    : "host";

  const initialSlide = Math.max(
    0,
    Math.min(
      Number(searchParams.get("slide") || "1") - 1,
      slides.length - 1
    )
  );
  const [current, setCurrent] = useState(initialSlide);
  const [showNotes, setShowNotes] = useState(false);
  const [theme, setTheme] = useState<SlideTheme>("dark");

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, slides.length - 1));
      setCurrent(clamped);
      const params = new URLSearchParams(searchParams.toString());
      params.set("slide", String(clamped + 1));
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    },
    [slides.length, searchParams, pathname]
  );

  const onRemoteSlideChange = useCallback(
    (slide: number) => {
      goTo(slide);
    },
    [goTo]
  );

  const onSessionEnd = useCallback(() => {
    setSessionCode(null);
    setHostToken(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("session");
    params.delete("role");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [searchParams, pathname]);

  const { broadcastSlide, liveSlide, viewers, connected } = useSessionSync({
    sessionCode,
    role,
    hostToken,
    onRemoteSlideChange,
    onSessionEnd,
  });

  const navigateSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, slides.length - 1));
      goTo(clamped);
      if (role === "host" && sessionCode) {
        broadcastSlide(clamped);
      }
    },
    [goTo, role, sessionCode, broadcastSlide, slides.length]
  );

  const next = useCallback(() => navigateSlide(current + 1), [navigateSlide, current]);
  const prev = useCallback(() => navigateSlide(current - 1), [navigateSlide, current]);

  const handleSessionStart = useCallback(
    (code: string, token: string) => {
      setSessionCode(code);
      setHostToken(token);
      sessionStorage.setItem(`session-token-${code}`, token);
      const params = new URLSearchParams(searchParams.toString());
      params.set("session", code);
      params.set("role", "host");
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
      broadcastSlide(current);
    },
    [searchParams, pathname, broadcastSlide, current]
  );

  const handleSessionEnd = useCallback(() => {
    if (sessionCode && hostToken) {
      fetch(`/api/sessions/${sessionCode}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: hostToken }),
      }).catch(() => {});
      sessionStorage.removeItem(`session-token-${sessionCode}`);
    }
    onSessionEnd();
  }, [sessionCode, hostToken, onSessionEnd]);

  const handleReturnToLive = useCallback(() => {
    if (liveSlide !== null) {
      goTo(liveSlide);
    }
  }, [liveSlide, goTo]);

  useEffect(() => {
    if (isPrinting || role === "display") return;

    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          navigateSlide(0);
          break;
        case "End":
          e.preventDefault();
          navigateSlide(slides.length - 1);
          break;
        case "n":
          setShowNotes((v) => !v);
          break;
        case "t":
          toggleTheme();
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, navigateSlide, slides.length, isPrinting, toggleTheme, role]);

  const handlePrintRequest = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("print", "true");
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (isPrinting) {
      const timeoutId = setTimeout(() => window.print(), 600);
      return () => clearTimeout(timeoutId);
    }
  }, [isPrinting]);

  if (isPrinting) {
    return (
      <div className="print-mode" data-slide-theme={theme}>
        {slides.map((slide, index) => (
          <div key={index} className="print-slide">
            <SlideShell
              current={index + 1}
              total={slides.length}
              isPrinting
              theme={theme}
              heading={slide.heading}
            >
              <MarkdownSlide
                markdown={slide.markdown}
                slug={slug}
                layout={slide.layout}
                images={slide.images}
                textContent={slide.textContent}
                theme={theme}
                columns={slide.columns}
              />
            </SlideShell>
          </div>
        ))}
      </div>
    );
  }

  // Display mode: full-screen slide only, no chrome
  if (role === "display") {
    const currentSlide = slides[current];
    return (
      <div
        className="fixed inset-0"
        data-slide-theme={theme}
        style={{
          background: "var(--slide-bg)",
          color: "var(--slide-text)",
          fontFamily: "var(--font-sans)",
          transition: "background 300ms ease, color 300ms ease",
        }}
      >
        <SlideShell
          current={current + 1}
          total={slides.length}
          theme={theme}
          heading={currentSlide.heading}
        >
          <MarkdownSlide
            markdown={currentSlide.markdown}
            slug={slug}
            layout={currentSlide.layout}
            images={currentSlide.images}
            textContent={currentSlide.textContent}
            theme={theme}
            columns={currentSlide.columns}
          />
        </SlideShell>
        <div className="session-display-indicator">
          <span className={`session-live-dot ${connected ? "session-live-dot--active" : ""}`} />
          {connected ? "LIVE" : "Connecting..."}
        </div>
      </div>
    );
  }

  // ─── Presenter View: Host with active session ───
  const isPresenterMode = role === "host" && !!sessionCode;

  const currentSlide = slides[current];
  const progress = ((current + 1) / slides.length) * 100;

  return (
    <div
      className="fixed inset-0 flex flex-col"
      data-slide-theme={theme}
      style={{
        background: "var(--slide-bg)",
        color: "var(--slide-text)",
        fontFamily: "var(--font-sans)",
        transition: "background 300ms ease, color 300ms ease",
      }}
    >
      {/* Top bar */}
      <div
        className="deck-chrome flex justify-between items-center px-5 py-3 z-10 backdrop-blur-md"
        style={{
          background: "var(--slide-chrome-bg)",
          borderBottom: "1px solid var(--slide-chrome-border)",
          transition: "background 300ms ease, border-color 300ms ease",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="transition-colors"
            style={{
              color: "var(--slide-chrome-text)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--slide-chrome-text)")}
          >
            &larr; All Decks
          </button>
          <span style={{ color: "var(--slide-chrome-border)" }}>|</span>
          <span
            className="truncate max-w-md"
            style={{
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--slide-text)",
            }}
          >
            {meta.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SessionControls
            slug={slug}
            sessionCode={sessionCode}
            role={role}
            viewers={viewers}
            connected={connected}
            liveSlide={liveSlide}
            currentSlide={current}
            onSessionStart={handleSessionStart}
            onSessionEnd={handleSessionEnd}
            onReturnToLive={handleReturnToLive}
          />
          <span style={{ color: "var(--slide-chrome-border)" }}>|</span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {!isPresenterMode && (
            <button
              onClick={() => setShowNotes((v) => !v)}
              className="transition-all"
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                border: showNotes ? "none" : "1px solid var(--slide-chrome-border)",
                background: showNotes ? "var(--accent)" : "transparent",
                color: showNotes ? "var(--accent-text)" : "var(--slide-chrome-text)",
                cursor: "pointer",
              }}
              title="Toggle speaker notes (N)"
            >
              Notes
            </button>
          )}
          <button
            onClick={handlePrintRequest}
            className="transition-all"
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--slide-chrome-border)",
              background: "transparent",
              color: "var(--slide-chrome-text)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--slide-bg-subtle)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "var(--slide-chrome-border)";
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide area */}
      <div className="flex-1 overflow-hidden relative">
        {isPresenterMode ? (
          <PresenterView
            slides={slides}
            current={current}
            slug={slug}
            theme={theme}
            navigateSlide={navigateSlide}
          />
        ) : (
          <div className="absolute inset-0 flex">
            <div
              className="flex-1"
              style={{
                borderRight:
                  showNotes && currentSlide.speakerNotes
                    ? "1px solid var(--slide-chrome-border)"
                    : "none",
              }}
            >
              <SlideShell current={current + 1} total={slides.length} theme={theme} heading={currentSlide.heading}>
                <MarkdownSlide
                  markdown={currentSlide.markdown}
                  slug={slug}
                  layout={currentSlide.layout}
                  images={currentSlide.images}
                  textContent={currentSlide.textContent}
                  theme={theme}
                  columns={currentSlide.columns}
                />
              </SlideShell>
            </div>

            {showNotes && currentSlide.speakerNotes && (
              <div
                className="w-80 p-5 overflow-y-auto"
                style={{
                  background: "var(--slide-notes-bg)",
                  transition: "background 300ms ease",
                }}
              >
                <h4
                  className="mb-3"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    letterSpacing: "var(--tracking-widest)",
                    textTransform: "uppercase" as const,
                    color: "var(--slide-text-muted)",
                  }}
                >
                  Speaker Notes
                </h4>
                <p
                  className="whitespace-pre-wrap"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--slide-text-secondary)",
                    lineHeight: "var(--leading-relaxed)",
                  }}
                >
                  {currentSlide.speakerNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div
        className="deck-chrome flex justify-between items-center px-5 py-3 backdrop-blur-md"
        style={{
          background: "var(--slide-chrome-bg)",
          borderTop: "1px solid var(--slide-chrome-border)",
          transition: "background 300ms ease, border-color 300ms ease",
        }}
      >
        <button
          onClick={prev}
          disabled={current === 0}
          className="transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--slide-chrome-text)",
            padding: "4px 12px",
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--slide-chrome-text)";
          }}
        >
          &larr; Previous
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => navigateSlide(i)}
              className="transition-all"
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: "var(--radius-full)",
                background: i === current ? "var(--accent)" : "var(--slide-dot-inactive)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 200ms ease, background 200ms ease",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === slides.length - 1}
          className="transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--slide-chrome-text)",
            padding: "4px 12px",
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--slide-chrome-text)";
          }}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
