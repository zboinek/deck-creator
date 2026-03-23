"use client";

import { useEffect, useRef, useState, useId } from "react";
import type { SlideTheme } from "./DeckPresentation";

interface MermaidDiagramProps {
  chart: string;
  theme?: SlideTheme;
}

let mermaidInitialized = false;

async function getMermaid() {
  const { default: mermaid } = await import("mermaid");
  return mermaid;
}

export function MermaidDiagram({ chart, theme = "dark" }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useId().replace(/:/g, "-");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = await getMermaid();

        const mermaidTheme = theme === "dark" ? "dark" : "default";

        mermaid.initialize({
          startOnLoad: false,
          theme: mermaidTheme,
          fontFamily: "var(--font-sans)",
          themeVariables:
            theme === "dark"
              ? {
                  primaryColor: "#27272a",
                  primaryTextColor: "#fafafa",
                  primaryBorderColor: "#d6f540",
                  lineColor: "#71717a",
                  secondaryColor: "#18181b",
                  tertiaryColor: "#141414",
                  noteBkgColor: "#27272a",
                  noteTextColor: "#fafafa",
                  noteBorderColor: "#d6f540",
                  actorBkg: "#27272a",
                  actorTextColor: "#fafafa",
                  actorBorder: "#d6f540",
                  signalColor: "#a1a1aa",
                  signalTextColor: "#fafafa",
                }
              : {
                  primaryColor: "#f4f4f5",
                  primaryTextColor: "#0a0a0a",
                  primaryBorderColor: "#16a34a",
                  lineColor: "#a1a1aa",
                  secondaryColor: "#e4e4e7",
                  tertiaryColor: "#f7f7f8",
                  noteBkgColor: "#f4f4f5",
                  noteTextColor: "#0a0a0a",
                  noteBorderColor: "#16a34a",
                  actorBkg: "#f4f4f5",
                  actorTextColor: "#0a0a0a",
                  actorBorder: "#16a34a",
                  signalColor: "#52525b",
                  signalTextColor: "#0a0a0a",
                },
        });
        mermaidInitialized = true;

        const diagramId = `mermaid-${uniqueId}-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(diagramId, chart);

        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setSvg("");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, theme, uniqueId]);

  if (error) {
    return (
      <pre
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          background: "var(--slide-code-bg)",
          border: "1px solid var(--slide-code-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          margin: "var(--space-4) 0",
          color: "#ef4444",
          whiteSpace: "pre-wrap",
        }}
      >
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
