import type { SlideTheme } from "./DeckPresentation";

interface SlideShellProps {
  children: React.ReactNode;
  current: number;
  total: number;
  isPrinting?: boolean;
  theme?: SlideTheme;
  heading?: string | null;
}

export function SlideShell({
  children,
  current,
  total,
  isPrinting,
  heading,
}: SlideShellProps) {
  return (
    <div
      className="relative w-full flex flex-col justify-center items-center overflow-hidden"
      style={{
        height: "100%",
        background: "var(--slide-bg)",
        color: "var(--slide-text)",
        padding: isPrinting
          ? "40px 48px"
          : "clamp(16px, 4.5vh, 48px) clamp(24px, 3.5vw, 64px)",
        transition: "background 300ms ease, color 300ms ease",
      }}
    >
      {heading && (
        <span
          className="absolute select-none"
          style={{
            top: "30px",
            left: "38px",
            fontSize: "var(--text-2xl)",
            fontWeight: 800,
            letterSpacing: "var(--tracking-tight)",
            color: "var(--slide-text)",
            lineHeight: "var(--leading-snug)",
            maxWidth: "60%",
          }}
        >
          {heading}
        </span>
      )}

      <div className="flex-1 flex flex-col justify-center items-center w-full overflow-y-auto">
        {children}
      </div>

      <span
        className="absolute select-none"
        style={{
          bottom: "16px",
          right: "24px",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          fontWeight: 500,
          color: "var(--slide-text-muted)",
          letterSpacing: "var(--tracking-wide)",
        }}
      >
        {current} / {total}
      </span>
    </div>
  );
}
