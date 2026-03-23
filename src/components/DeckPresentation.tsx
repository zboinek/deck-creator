"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlideShell } from "./SlideShell";
import { MarkdownSlide } from "./MarkdownSlide";
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

export function DeckPresentation({ meta, slides, slug }: DeckPresentationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isPrinting = searchParams.get("print") === "true";

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

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  useEffect(() => {
    if (isPrinting) return;

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
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(slides.length - 1);
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
  }, [next, prev, goTo, slides.length, isPrinting, toggleTheme]);

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
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
              onClick={() => goTo(i)}
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
