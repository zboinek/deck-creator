"use client";

import { useEffect, useRef, useState } from "react";

interface Chapter { id: string; title: string; timestamp?: string }

export function ArticleNavigation({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id);
  const [progress, setProgress] = useState(0);
  const mobileMenu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const article = document.getElementById("article-body");
      if (!article) return;
      const bounds = article.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - window.innerHeight + 100);
      setProgress(Math.round(Math.max(0, Math.min(1, (100 - bounds.top) / travel)) * 100));
      let current = chapters[0]?.id;
      for (const chapter of chapters) {
        if ((document.getElementById(chapter.id)?.getBoundingClientRect().top ?? Infinity) <= 180) current = chapter.id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    const article = document.getElementById("article-body");
    if (article) observer.observe(article);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [chapters]);

  const links = (
    <ol className="article-toc-list">
      {chapters.map((chapter, index) => (
        <li key={chapter.id}>
          <a href={`#${chapter.id}`} aria-current={active === chapter.id ? "location" : undefined}
            onClick={() => { if (mobileMenu.current) mobileMenu.current.open = false; }}>
            <span className="article-toc-number">{String(index + 1).padStart(2, "0")}</span>
            <span>{chapter.title}</span>
            {chapter.timestamp && <span className="article-toc-time">{chapter.timestamp}</span>}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <div className="article-scroll-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <aside className="article-sidebar">
        <nav className="article-toc-desktop" aria-label="Spis treści artykułu">
          <p className="article-label">W tym artykule</p>
          {links}
          <p className="article-toc-note">Czasy orientacyjne dla narracji.</p>
          <div className="article-reading-progress"><span>Przeczytano</span><span>{progress}%</span></div>
        </nav>
        <details ref={mobileMenu} className="article-toc-mobile">
          <summary>Spis treści <span>{chapters.length} rozdziałów</span></summary>
          <nav aria-label="Spis treści na telefonie">{links}</nav>
          <p className="article-toc-note">Czasy orientacyjne dla narracji.</p>
        </details>
      </aside>
    </>
  );
}
