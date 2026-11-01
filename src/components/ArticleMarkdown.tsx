import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArticleDiagram } from "./ArticleTheme";

export function ArticleMarkdown({ markdown, slug }: { markdown: string; slug: string }) {
  const components: Components = {
    p: ({ node, children }) => node?.children.some(child => child.type === "element" && child.tagName === "img")
      ? <div className="article-media-block">{children}</div> : <p>{children}</p>,
    img: ({ src, alt, title }) => {
      if (typeof src !== "string") return null;
      const url = /^(https?:\/\/|\/)/.test(src) ? src : `/api/podcasts/${slug}/${src.startsWith("attachments/") ? src : `attachments/${src}`}`;
      return (
        <figure className="article-figure">
          <a href={url} target="_blank" rel="noreferrer" aria-label={`Powiększ ilustrację: ${alt || "schemat"}`}>
            <img src={url} alt={alt || ""} loading="lazy" decoding="async" />
            <span className="article-figure-zoom" aria-hidden="true">Powiększ ↗</span>
          </a>
          {title && <figcaption>{title}</figcaption>}
        </figure>
      );
    },
    pre: ({ node, children }) => {
      const code = node?.children.find(child => child.type === "element" && child.tagName === "code");
      if (code?.type === "element" && Array.isArray(code.properties.className) && code.properties.className.includes("language-mermaid")) {
        const chart = code.children.filter(child => child.type === "text").map(child => child.value).join("");
        return (
          <figure className="article-diagram">
            <div className="article-diagram-scroll" tabIndex={0} role="region" aria-label="Schemat omawianego procesu, przewijany poziomo">
              <ArticleDiagram chart={chart} />
            </div>
            <figcaption className="article-diagram-hint">Przesuń schemat w poziomie, aby zobaczyć całość.</figcaption>
          </figure>
        );
      }
      return <pre>{children}</pre>;
    },
    table: ({ children }) => <div className="article-table" tabIndex={0} role="region" aria-label="Tabela, przewijana poziomo"><table>{children}</table></div>,
    a: ({ href, children }) => <a href={href} {...(href?.startsWith("https://") ? { target: "_blank", rel: "noreferrer" } : {})}>{children}</a>,
  };
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{markdown}</ReactMarkdown>;
}
