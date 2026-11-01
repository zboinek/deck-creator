"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SlideTheme } from "./DeckPresentation";
import { MermaidDiagram } from "./MermaidDiagram";

const ArticleThemeContext = createContext<{ theme: SlideTheme; toggle: () => void }>({ theme: "light", toggle: () => {} });
const STORAGE_KEY = "article-theme";

export function ArticleTheme({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SlideTheme>("light");

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* Storage may be disabled. */ }
      setTheme(saved === "light" || saved === "dark" ? saved : system.matches ? "dark" : "light");
    };
    sync();
    system.addEventListener("change", sync);
    return () => system.removeEventListener("change", sync);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* The toggle still works without storage. */ }
  };

  return (
    <ArticleThemeContext.Provider value={{ theme, toggle }}>
      <div className="podcast-article" data-slide-theme={theme} lang="pl" id="article-top">{children}</div>
    </ArticleThemeContext.Provider>
  );
}

export function ArticleThemeToggle() {
  const { theme, toggle } = useContext(ArticleThemeContext);
  return (
    <button className="theme-toggle" onClick={toggle} aria-label={`Włącz ${theme === "light" ? "ciemny" : "jasny"} motyw`}>
      <span className={`theme-toggle__option ${theme === "light" ? "theme-toggle__option--active" : ""}`} aria-hidden>☼</span>
      <span className={`theme-toggle__option ${theme === "dark" ? "theme-toggle__option--active" : ""}`} aria-hidden>☾</span>
    </button>
  );
}

export function ArticleDiagram({ chart }: { chart: string }) {
  const { theme } = useContext(ArticleThemeContext);
  return <MermaidDiagram chart={chart} theme={theme} />;
}
