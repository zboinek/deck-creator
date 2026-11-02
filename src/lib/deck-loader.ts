import fs from "fs/promises";
import path from "path";
import { parseDeck, type ParsedDeck, type DeckMeta } from "./deck-parser";

const DECKS_DIR = path.join(process.cwd(), "decks");

export interface DeckSummary {
  slug: string;
  meta: DeckMeta;
  slideCount: number;
}

export async function listDecks(): Promise<DeckSummary[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(DECKS_DIR);
  } catch {
    return [];
  }

  const summaries: DeckSummary[] = [];

  for (const entry of entries) {
    const deckPath = path.join(DECKS_DIR, entry, "deck.md");
    try {
      const raw = await fs.readFile(deckPath, "utf-8");
      const deck = parseDeck(raw);
      summaries.push({
        slug: entry,
        meta: deck.meta,
        slideCount: deck.slides.length,
      });
    } catch {
      // skip directories without a valid deck.md
    }
  }

  return summaries.sort((a, b) => {
    const dateA = String(a.meta.date ?? "");
    const dateB = String(b.meta.date ?? "");
    return dateB.localeCompare(dateA);
  });
}

export async function loadDeck(slug: string): Promise<ParsedDeck | null> {
  const deckPath = path.join(DECKS_DIR, slug, "deck.md");
  try {
    const raw = await fs.readFile(deckPath, "utf-8");
    return parseDeck(raw);
  } catch {
    return null;
  }
}

/** Language of deck.md; translations live next to it as deck-<lang>.md (e.g. deck-en.md). */
export const DEFAULT_DECK_LANG = "pl";

export async function loadDeckTranslations(slug: string): Promise<Record<string, ParsedDeck>> {
  const dir = path.join(DECKS_DIR, slug);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return {};
  }
  const translations: Record<string, ParsedDeck> = {};
  for (const entry of entries) {
    const match = /^deck-([a-z]{2})\.md$/.exec(entry);
    if (!match || match[1] === DEFAULT_DECK_LANG) continue;
    try {
      const deck = parseDeck(await fs.readFile(path.join(dir, entry), "utf-8"));
      if (deck.slides.length > 0) translations[match[1]] = deck;
    } catch {
      // skip unreadable translation
    }
  }
  return translations;
}
