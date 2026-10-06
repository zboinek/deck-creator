import { load as loadYaml } from "js-yaml";

export interface DeckMeta {
  title: string;
  date?: string;
  author?: string;
  description?: string;
  theme?: string;
  category?: string;
  [key: string]: unknown;
}

export type SlideLayout = "default" | "two-column" | "two-column-text" | "full-image";

export interface SlideImage {
  alt: string;
  src: string;
  width?: string;
}

export interface ParsedSlide {
  index: number;
  markdown: string;
  speakerNotes: string | null;
  layout: SlideLayout;
  images: SlideImage[];
  /** Markdown with images stripped (for two-column: text goes left, images go right) */
  textContent: string;
  /** ## heading extracted for display in slide chrome (top-right corner) */
  heading: string | null;
  /** For two-column-text layout: content split by <!-- columns --> marker */
  columns: [string, string] | null;
}

export interface ParsedDeck {
  meta: DeckMeta;
  slides: ParsedSlide[];
}

const SPEAKER_NOTE_PATTERN =
  /^>\s*_(?:Note|Notatka prowadzącego|Speaker note):_\s*/i;
const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g;

function extractSpeakerNotes(markdown: string): {
  content: string;
  notes: string | null;
} {
  const lines = markdown.split("\n");
  const contentLines: string[] = [];
  const noteLines: string[] = [];
  let inNote = false;

  for (const line of lines) {
    if (SPEAKER_NOTE_PATTERN.test(line)) {
      inNote = true;
      const noteText = line
        .replace(SPEAKER_NOTE_PATTERN, "")
        .replace(/_$/, "");
      noteLines.push(noteText);
    } else if (inNote && line.startsWith(">")) {
      noteLines.push(line.replace(/^>\s?/, "").replace(/_$/, ""));
    } else {
      inNote = false;
      contentLines.push(line);
    }
  }

  return {
    content: contentLines.join("\n").trim(),
    notes: noteLines.length > 0 ? noteLines.join("\n").trim() : null,
  };
}

function extractHeading(markdown: string): {
  content: string;
  heading: string | null;
} {
  const lines = markdown.split("\n");
  const contentLines: string[] = [];
  let heading: string | null = null;

  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) continue;

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      if (!heading) heading = h2Match[1].trim();
      continue;
    }

    contentLines.push(line);
  }

  return {
    content: contentLines.join("\n").replace(/\n{3,}/g, "\n\n").trim(),
    heading,
  };
}

function extractImages(markdown: string): SlideImage[] {
  const images: SlideImage[] = [];
  let match;
  const regex = new RegExp(IMAGE_PATTERN);
  while ((match = regex.exec(markdown)) !== null) {
    const rawAlt = match[1];
    const src = match[2];
    
    let alt = rawAlt;
    let width: string | undefined = undefined;
    
    const parts = rawAlt.split('|');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].trim();
      if (/^(\d+%|\d+px|auto)$/i.test(lastPart)) {
        width = lastPart;
        alt = parts.slice(0, -1).join('|').trim();
      }
    }

    images.push({ alt, src, width });
  }
  return images;
}

function stripImages(markdown: string): string {
  return markdown
    .replace(IMAGE_PATTERN, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const COLUMNS_MARKER = /<!--\s*columns\s*-->/i;

function extractColumns(markdown: string): { hasColumns: boolean; left: string; right: string; cleaned: string } {
  if (!COLUMNS_MARKER.test(markdown)) {
    return { hasColumns: false, left: "", right: "", cleaned: markdown };
  }
  const parts = markdown.split(COLUMNS_MARKER);
  const left = parts[0].trim();
  const right = parts.slice(1).join("").trim();
  const cleaned = `${left}\n\n${right}`;
  return { hasColumns: true, left, right, cleaned };
}

function detectLayout(markdown: string, images: SlideImage[], hasColumns: boolean): SlideLayout {
  if (hasColumns) return "two-column-text";
  if (images.length === 0) return "default";

  const textOnly = stripImages(markdown);
  const meaningfulLines = textOnly
    .split("\n")
    .filter((l) => l.trim().length > 0);

  const isHeadingOnly = meaningfulLines.every(
    (l) => l.startsWith("#") || l.trim() === ""
  );
  if (meaningfulLines.length <= 1 || isHeadingOnly) {
    return "full-image";
  }

  return "two-column";
}

function extractTitle(rawContent: string): string {
  const h1Match = rawContent.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  const h2Match = rawContent.match(/^##\s+(.+)$/m);
  if (h2Match) return h2Match[1].trim();

  return "Untitled Deck";
}

// Frontmatter: "---\n<yaml>\n---\n" na samym początku pliku.
// Nieudane parsowanie YAML rzuca - deck ze zepsutym frontmatterem ma być
// widocznie zepsuty, a nie po cichu pozbawiony metadanych.
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

function extractFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const src = raw.replace(/^\uFEFF/, "");
  const match = src.match(FRONTMATTER_PATTERN);
  if (!match) {
    return { data: {}, content: src };
  }
  const parsed = loadYaml(match[1]) as Record<string, unknown> | null;
  return {
    data: parsed && typeof parsed === "object" ? parsed : {},
    content: src.slice(match[0].length),
  };
}

export function parseDeck(raw: string): ParsedDeck {
  const { data: frontmatter, content } = extractFrontmatter(raw);

  const slideChunks = content
    .split(/\n---\n/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);

  const slides: ParsedSlide[] = slideChunks.map((chunk, index) => {
    const { content: slideContent, notes } = extractSpeakerNotes(chunk);
    const { content: bodyContent, heading } = extractHeading(slideContent);
    const { hasColumns, left, right, cleaned } = extractColumns(bodyContent);
    const images = extractImages(cleaned);
    const layout = detectLayout(cleaned, images, hasColumns);
    const textContent = stripImages(cleaned);

    return {
      index,
      markdown: cleaned,
      speakerNotes: notes,
      layout,
      images,
      textContent,
      heading,
      columns: hasColumns ? [left, right] : null,
    };
  });

  const title = (frontmatter.title as string) || extractTitle(content);

  // gray-matter parses unquoted YAML dates into Date objects; normalize to
  // YYYY-MM-DD so sorting and rendering stay chronological, not weekday-alphabetical.
  const rawDate = frontmatter.date;
  const date =
    rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : typeof rawDate === "string"
        ? rawDate
        : undefined;

  const meta: DeckMeta = {
    ...frontmatter,
    title,
    date,
  };

  return { meta, slides };
}
