import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { loadArticle } from "@/lib/article-loader";
import { ArticleMarkdown } from "@/components/ArticleMarkdown";
import { ArticleAudio } from "@/components/ArticleAudio";
import { ArticleNavigation } from "@/components/ArticleNavigation";
import { ArticleTheme, ArticleThemeToggle } from "@/components/ArticleTheme";
import "./article.css";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await loadArticle((await params).slug);
  if (!article) return { title: "Nie znaleziono artykułu" };
  return {
    title: `${article.meta.title} · ${article.meta.author || "Deck Creator"}`,
    description: article.meta.description,
    ...(article.meta.unlisted ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: "article", title: article.meta.title, description: article.meta.description, locale: "pl_PL" },
  };
}

export default async function PodcastPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article || !article.sections.length) notFound();
  const { meta, sections, introduction, hasAudio } = article;
  const date = meta.date && /^\d{4}-\d{2}-\d{2}$/.test(meta.date) && Number.isFinite(Date.parse(meta.date))
    ? new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(meta.date)) : null;

  return (
    <ArticleTheme>
      <a className="article-skip" href="#article-body">Przejdź do treści</a>
      <header className="article-topbar">
        <Link href="/" className="article-brand">Wykłady</Link>
        <div className="article-topbar-actions">
          <a href="#article-body" className="article-topbar-label">Podcast / Artykuł</a>
          <ArticleThemeToggle />
        </div>
      </header>

      <main className="article-container">
        <header className="article-hero">
          <div className="article-kicker">{meta.series || "Podcast"}<span className="article-kicker-separator">/</span>Esej audio</div>
          {meta.eyebrow && <p className="article-eyebrow">{meta.eyebrow}</p>}
          <h1>{meta.title}</h1>
          {meta.description && <p className="article-description">{meta.description}</p>}
          <div className="article-meta">
            {meta.author && <span className="article-author">{meta.author}</span>}
            {date && <time dateTime={meta.date}>{date}</time>}
            {meta.duration && <span>Około {meta.duration} czytania i słuchania</span>}
          </div>
        </header>

        {hasAudio && <ArticleAudio slug={slug} title={meta.title} author={meta.author} series={meta.series} version={article.audioVersion} />}

        <div className="article-layout">
          <ArticleNavigation chapters={sections.map(({ id, title, timestamp }) => ({ id, title, timestamp }))} />
          <article id="article-body" className="article-body" aria-label={meta.title}>
            {introduction && <div className="article-prose"><ArticleMarkdown markdown={introduction} slug={slug} /></div>}
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="article-section" aria-labelledby={`${section.id}-title`}>
                <header className="article-section-heading">
                  <div className="article-section-marker"><span>{String(index + 1).padStart(2, "0")}</span>{section.timestamp && <span className="article-section-time">{section.timestamp}</span>}</div>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                </header>
                <div className="article-prose"><ArticleMarkdown markdown={section.markdown} slug={slug} /></div>
              </section>
            ))}
            <footer className="article-footer"><span>Koniec artykułu</span><a href="#article-top">Wróć na początek ↑</a></footer>
          </article>
        </div>
      </main>
    </ArticleTheme>
  );
}
