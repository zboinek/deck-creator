import fs from "fs/promises";
import path from "path";
import { cache } from "react";
import { JSON_SCHEMA, load as loadYaml } from "js-yaml";

export interface ArticleSection {
  id: string;
  title: string;
  timestamp?: string;
  markdown: string;
}

export interface Article {
  hasAudio?: boolean;
  audioVersion?: string;
  meta: {
    title: string;
    eyebrow?: string;
    description?: string;
    author?: string;
    date?: string;
    duration?: string;
    series?: string;
    unlisted: boolean;
  };
  introduction: string;
  sections: ArticleSection[];
}

export const PODCASTS_DIR = path.join(process.cwd(), "podcasts");
export const validArticleSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export async function findArticleAudio(slug: string) {
  if (!validArticleSlug(slug)) return null;
  for (const extension of ["opus", "mp3"]) {
    const file = path.join(PODCASTS_DIR, slug, `${slug}.${extension}`);
    try {
      const info = await fs.stat(file);
      if (info.isFile() && info.size > 0) return {
        file, size: info.size,
        contentType: extension === "opus" ? "audio/ogg" : "audio/mpeg",
        version: `${extension}-${info.size}-${Math.trunc(info.mtimeMs)}`,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return null;
}

function headingId(title: string): string {
  return title.toLowerCase().replace(/ł/g, "l").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "rozdzial";
}

export function parseArticle(raw: string): Article {
  const match = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Article requires YAML frontmatter");
  const data = loadYaml(match[1], { schema: JSON_SCHEMA }) as Record<string, unknown>;
  if (!data || typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("Article requires a title");
  }
  const text = (key: string) => typeof data[key] === "string" ? data[key] as string : undefined;
  const sections: ArticleSection[] = [];
  const introduction: string[] = [];
  const ids = new Set<string>();
  let fence: { character: string; length: number } | undefined;

  for (const line of match[2].split("\n")) {
    const delimiter = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (delimiter) {
      if (!fence) fence = { character: delimiter[1][0], length: delimiter[1].length };
      else if (delimiter[1][0] === fence.character && delimiter[1].length >= fence.length && !delimiter[2].trim()) fence = undefined;
    }
    const heading = !fence && line.match(/^##\s+(?:(\d{1,2}:\d{2})\s*\|\s*)?(.+?)\s*$/);
    if (heading) {
      const base = headingId(heading[2]);
      let id = base;
      let suffix = 2;
      while (ids.has(id)) id = `${base}-${suffix++}`;
      ids.add(id);
      sections.push({ id, title: heading[2], timestamp: heading[1], markdown: "" });
    } else if (sections.length) {
      sections[sections.length - 1].markdown += `${line}\n`;
    } else introduction.push(line);
  }

  return {
    meta: {
      title: data.title.trim(), eyebrow: text("eyebrow"), description: text("description"),
      author: text("author"), date: text("date"), duration: text("duration"),
      series: text("series"), unlisted: data.unlisted === true,
    },
    introduction: introduction.join("\n").trim(),
    sections: sections.map(section => ({ ...section, markdown: section.markdown.trim() })),
  };
}

// React cache deduplicates the metadata/page read within a request, not across edits.
export const loadArticle = cache(async (slug: string): Promise<Article | null> => {
  if (!validArticleSlug(slug)) return null;
  try {
    const article = parseArticle(await fs.readFile(path.join(PODCASTS_DIR, slug, "article.md"), "utf8"));
    const audio = await findArticleAudio(slug);
    article.hasAudio = audio !== null;
    article.audioVersion = audio?.version;
    return article;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
});

export async function listPodcasts() {
  let entries;
  try {
    entries = await fs.readdir(PODCASTS_DIR, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const podcasts: { slug: string; meta: Article["meta"] }[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !validArticleSlug(entry.name)) continue;
    const article = await loadArticle(entry.name);
    if (article && !article.meta.unlisted && article.sections.length && article.hasAudio) {
      podcasts.push({ slug: entry.name, meta: article.meta });
    }
  }
  return podcasts.sort((a, b) => (b.meta.date || "").localeCompare(a.meta.date || ""));
}
