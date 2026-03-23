"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import type { SlideLayout, SlideImage } from "@/lib/deck-parser";
import type { SlideTheme } from "./DeckPresentation";
import { MermaidDiagram } from "./MermaidDiagram";

function rewriteImageSrc(src: string, slug: string): string {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  if (src.startsWith("attachments/")) {
    return `/api/decks/${slug}/${src}`;
  }
  return `/api/decks/${slug}/attachments/${src}`;
}

function makeComponents(slug: string, theme: SlideTheme = "dark"): Components {
  return {
    h1: () => null,
    h2: () => null,
    h3: ({ children }) => (
      <h3
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: 600,
          letterSpacing: "var(--tracking-tight)",
          lineHeight: "var(--leading-snug)",
          marginBottom: "var(--space-3)",
          textWrap: "balance" as never,
          color: "var(--slide-text)",
        }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: 500,
          letterSpacing: "var(--tracking-tight)",
          lineHeight: "var(--leading-snug)",
          marginBottom: "var(--space-2)",
          color: "var(--slide-text)",
        }}
      >
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p
        style={{
          fontSize: "var(--text-lg)",
          lineHeight: "var(--leading-relaxed)",
          marginBottom: "var(--space-3)",
          color: "var(--slide-text-secondary)",
        }}
      >
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul
        className="list-disc list-outside"
        style={{
          marginLeft: "var(--space-6)",
          marginBottom: "var(--space-3)",
          fontSize: "var(--text-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className="list-decimal list-outside"
        style={{
          marginLeft: "var(--space-6)",
          marginBottom: "var(--space-3)",
          fontSize: "var(--text-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li
        style={{
          lineHeight: "var(--leading-relaxed)",
          color: "var(--slide-text-secondary)",
        }}
      >
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: "3px solid var(--accent)",
          paddingLeft: "var(--space-4)",
          paddingTop: "var(--space-1)",
          paddingBottom: "var(--space-1)",
          marginTop: "var(--space-4)",
          marginBottom: "var(--space-4)",
          fontStyle: "italic",
          fontSize: "var(--text-base)",
          color: "var(--slide-text-secondary)",
        }}
      >
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto" style={{ margin: "var(--space-4) 0" }}>
        <table
          style={{
            minWidth: "100%",
            fontSize: "var(--text-sm)",
            borderCollapse: "collapse",
          }}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead
        style={{ borderBottom: "2px solid var(--slide-border)" }}
      >
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th
        style={{
          padding: "var(--space-2) var(--space-4)",
          textAlign: "left",
          fontWeight: 600,
          color: "var(--slide-text)",
          fontSize: "var(--text-sm)",
          letterSpacing: "var(--tracking-wide)",
        }}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td
        style={{
          padding: "var(--space-2) var(--space-4)",
          borderTop: "1px solid var(--slide-border)",
          color: "var(--slide-text-secondary)",
        }}
      >
        {children}
      </td>
    ),
    code: ({ className, children }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.9em",
              background: "var(--slide-code-inline-bg)",
              color: "var(--slide-code-inline-text)",
              padding: "2px 6px",
              borderRadius: "var(--radius-sm)",
              fontWeight: 500,
            }}
          >
            {children}
          </code>
        );
      }
      if (className?.includes("language-mermaid")) {
        const chart = String(children).replace(/\n$/, "");
        return <MermaidDiagram chart={chart} theme={theme} />;
      }
      return (
        <code className={`${className ?? ""}`} style={{ fontSize: "var(--text-sm)" }}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => {
      const child = children as React.ReactElement<{ className?: string }>;
      if (child?.props?.className?.includes("language-mermaid")) {
        return <>{children}</>;
      }
      return (
        <pre
          style={{
            fontFamily: "var(--font-mono)",
            background: "var(--slide-code-bg)",
            border: "1px solid var(--slide-code-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            margin: "var(--space-4) 0",
            overflowX: "auto",
            fontSize: "var(--text-sm)",
            lineHeight: "var(--leading-relaxed)",
          }}
        >
          {children}
        </pre>
      );
    },
    strong: ({ children }) => (
      <strong style={{ fontWeight: 700, color: "var(--slide-text)" }}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em style={{ fontStyle: "italic", color: "var(--slide-text-secondary)" }}>
        {children}
      </em>
    ),
    hr: () => (
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--slide-border)",
          margin: "var(--space-8) 0",
        }}
      />
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        style={{
          color: "var(--slide-link-color)",
          textDecoration: "underline",
          textDecorationColor: "var(--slide-link-underline)",
          textUnderlineOffset: "3px",
          fontWeight: 500,
          transition: "text-decoration-color var(--transition-fast)",
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }) => {
      const resolved = typeof src === "string" ? rewriteImageSrc(src, slug) : "";
      return (
        <img
          src={resolved}
          alt={alt ?? ""}
          className="max-w-full max-h-full object-contain"
          style={{ borderRadius: "var(--radius-md)" }}
          loading="lazy"
        />
      );
    },
  };
}

interface MarkdownSlideProps {
  markdown: string;
  slug: string;
  layout?: SlideLayout;
  images?: SlideImage[];
  textContent?: string;
  theme?: SlideTheme;
  columns?: [string, string] | null;
}

function FullImageSlide({ images, textContent, slug, theme = "dark" }: {
  images: SlideImage[];
  textContent: string;
  slug: string;
  theme?: SlideTheme;
}) {
  const image = images[0];
  const hasTitle = textContent.trim().length > 0;
  const resolvedSrc = rewriteImageSrc(image.src, slug);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ gap: "var(--space-4)" }}>
      {hasTitle && (
        <div className="text-center" style={{ marginBottom: "var(--space-2)" }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={makeComponents(slug, theme)}
          >
            {textContent}
          </ReactMarkdown>
        </div>
      )}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <img
          src={resolvedSrc}
          alt={image.alt}
          className="max-w-full max-h-full object-contain"
          style={{ borderRadius: "var(--radius-md)" }}
          loading="lazy"
        />
      </div>
    </div>
  );
}

function TwoColumnSlide({ textContent, images, slug, theme = "dark" }: {
  textContent: string;
  images: SlideImage[];
  slug: string;
  theme?: SlideTheme;
}) {
  return (
    <div
      className="w-full h-full grid grid-cols-2 items-center"
      style={{ gap: "var(--space-8)" }}
    >
      <div className="slide-content overflow-y-auto max-h-full" style={{ paddingRight: "var(--space-4)" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={makeComponents(slug, theme)}
        >
          {textContent}
        </ReactMarkdown>
      </div>
      <div className="flex flex-col items-center justify-center h-full" style={{ gap: "var(--space-4)" }}>
        {images.map((img, i) => {
          const resolvedSrc = rewriteImageSrc(img.src, slug);
          return (
            <div key={i} className="flex-1 min-h-0 flex items-center justify-center w-full">
              <img
                src={resolvedSrc}
                alt={img.alt}
                className="max-w-full max-h-full object-contain"
                style={{ borderRadius: "var(--radius-md)" }}
                loading="lazy"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TwoColumnTextSlide({ columns, slug, theme = "dark" }: {
  columns: [string, string];
  slug: string;
  theme?: SlideTheme;
}) {
  return (
    <div
      className="w-full h-full grid grid-cols-2 items-center"
      style={{ gap: "var(--space-8)" }}
    >
      <div className="slide-content overflow-y-auto max-h-full" style={{ paddingRight: "var(--space-4)" }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={makeComponents(slug, theme)}
        >
          {columns[0]}
        </ReactMarkdown>
      </div>
      <div
        className="slide-content overflow-y-auto max-h-full"
        style={{
          paddingLeft: "var(--space-4)",
          borderLeft: "1px solid var(--slide-border)",
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={makeComponents(slug, theme)}
        >
          {columns[1]}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export function MarkdownSlide({
  markdown,
  slug,
  layout = "default",
  images = [],
  textContent = "",
  theme = "dark",
  columns,
}: MarkdownSlideProps) {
  if (layout === "two-column-text" && columns) {
    return <TwoColumnTextSlide columns={columns} slug={slug} theme={theme} />;
  }

  if (layout === "full-image" && images.length > 0) {
    return (
      <FullImageSlide images={images} textContent={textContent} slug={slug} theme={theme} />
    );
  }

  if (layout === "two-column" && images.length > 0) {
    return (
      <TwoColumnSlide
        textContent={textContent}
        images={images}
        slug={slug}
        theme={theme}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto slide-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={makeComponents(slug, theme)}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
