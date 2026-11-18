import fs from "fs/promises";
import path from "path";

/** One line of hits.jsonl. */
export interface Hit {
  /** ISO timestamp */
  t: string;
  type: "view" | "slide";
  path: string;
  /** Random id of one page load, generated in the browser (no cookie). */
  pv: string;
  /** Visitor hash: IP + user agent + a salt that changes daily. Not reversible, not linkable across days. */
  v: string;
  /** Referring site (host only), view events only. */
  ref?: string;
  dev?: "mobile" | "tablet" | "desktop";
  br?: string;
  /** Furthest slide reached (1-based) and slide count, slide events only. */
  slide?: number;
  total?: number;
}

export const STATS_DIR = process.env.STATS_DIR || path.join(process.cwd(), "data");
export const HITS_FILE = path.join(STATS_DIR, "hits.jsonl");

/** Hard cap, so a flood of fake hits cannot fill the disk. */
const MAX_FILE_BYTES = 100 * 1024 * 1024;

let knownSize: number | null = null;
let capWarned = false;
let queue: Promise<void> = Promise.resolve();

export function appendHit(hit: Hit): Promise<void> {
  // Serialize writes so concurrent requests never interleave lines.
  queue = queue.then(async () => {
    try {
      if (knownSize === null) {
        await fs.mkdir(STATS_DIR, { recursive: true });
        knownSize = await fs.stat(HITS_FILE).then((s) => s.size, () => 0);
      }
      const line = JSON.stringify(hit) + "\n";
      const bytes = Buffer.byteLength(line);
      if (knownSize + bytes > MAX_FILE_BYTES) {
        if (!capWarned) {
          console.warn(`[stats] ${HITS_FILE} reached ${MAX_FILE_BYTES} bytes, new hits are dropped`);
          capWarned = true;
        }
        return;
      }
      await fs.appendFile(HITS_FILE, line, "utf8");
      knownSize += bytes;
    } catch (error) {
      console.error("[stats] could not write hit:", error);
      knownSize = null;
    }
  });
  return queue;
}

export async function readHits(): Promise<Hit[]> {
  let raw: string;
  try {
    raw = await fs.readFile(HITS_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const hits: Hit[] = [];
  for (const line of raw.split("\n")) {
    if (!line) continue;
    try {
      hits.push(JSON.parse(line) as Hit);
    } catch {
      // skip a damaged line (e.g. a write cut off by a crash)
    }
  }
  return hits;
}
