---
name: create-deck-infographic
description: >-
  Build custom infographics for Deck Creator slides by authoring HTML/CSS and
  rendering it to PNG with headless Chrome. Use when a slide needs a diagram,
  chart, comparison, budget bar, timeline or any visual that Markdown, tables
  and Mermaid cannot express, or when the user asks for "grafika", "infografika",
  "wykres", "diagram" on a slide.
---

# Create Deck Infographic

Deck Creator renders Markdown. When a slide needs a purpose-built visual, author it as a standalone **HTML file**, screenshot it with **headless Chrome**, and embed the resulting **PNG** in `deck.md`.

Pair this skill with `create-deck-markdown`, which owns the `deck.md` format itself.

## Why HTML → PNG, not inline HTML

`MarkdownSlide.tsx` runs `react-markdown` with `remarkGfm` + `rehypeHighlight` and **no `rehypeRaw`**. Raw HTML in `deck.md` is silently dropped. There is no way to put live HTML on a slide, the only paths are Markdown, Mermaid fences, and images.

So: HTML is the *authoring* medium, PNG is the *delivery* medium. Keep the `.html` next to `deck.md` so the graphic stays editable.

```
decks/<deck-name>/
  deck.md
  gpu-memory.html          # source, edit this, commit it
  attachments/
    gpu-memory.png         # generated, referenced by deck.md
```

Use Mermaid instead when the visual is a plain flow/sequence/graph, since it is already supported in ```mermaid fences and needs no build step. Reach for this skill when you need real layout control: proportional bars, an axis, overlays, annotated regions, precise typography.

---

## Design language

Decks in this repo are **light**: white background, dark text, one accent colour.

> Note: `DeckPresentation.tsx` initialises `theme` to `"dark"` and only flips to light when the OS reports a light colour scheme (`T` toggles it). Design for **light** regardless: every existing deck graphic is white-background, and a dark PNG will stand out as a mistake.

Pull colours straight from `src/app/globals.css` (the `[data-theme="light"]` block) so graphics sit flush with the slide:

| Token | Value | Use |
|---|---|---|
| Background | `#ffffff` | canvas |
| Text | `#0a0a0a` | title, labels, data values |
| Text secondary | `#52525b` | subtitle, legend, body copy |
| Text muted | `#8b8b93` | axis ticks, footnotes |
| Border | `#e4e4e7` | hairlines, rules |
| Border strong | `#d4d4d8` | shape outlines that must read |
| **Accent** | `rgb(235, 123, 22)` | **Comtegra orange, the one colour** |

**Never use an em dash (—) in any text that ends up on a slide.** Rewrite with a comma, a colon, or a connective ("tylko", "czyli", "bo"). Ranges keep the en dash (2–4 karty). The author reads that character as a sign the text was machine-written, which is fatal for material presented as his own. Check with `grep -c '—\|&mdash;'` before rendering.

Rules that keep it coherent:

- **One colour.** Orange marks the thing the slide is about. Everything else is greyscale. If two things are orange, the slide has two messages, so split it.
- **Greys carry structure**, orange carries meaning. Hatched light grey (`repeating-linear-gradient(-45deg, #ffffff 0 7px, #ededf0 7px 14px)`) reads as "space/remainder" without competing.
- **Text on orange is white** with `text-shadow: 0 1px 1px rgba(0,0,0,.22)`, matching the Artificial Analysis charts already in the deck. Everywhere else, dark on white.
- Fonts: `Inter` for prose, `JetBrains Mono` for numbers, axis ticks and rules of thumb. Loaded from Google Fonts, so **the render machine needs network access**.

---

## Canvas and rendering

Author at **1600 × 900** (16:9), render at **2×** for a 3200 × 1800 PNG that stays sharp on a projector and in PDF export.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1600,900 \
  --screenshot="/abs/path/decks/<deck>/attachments/<name>.png" \
  "file:///abs/path/decks/<deck>/<name>.html"
```

- `--window-size` **must** equal the `body` dimensions. A mismatch clips content or introduces scrollbars.
- Both paths must be **absolute**; the file URL needs the `file://` scheme.
- Set `body { width: 1600px; height: 900px; }` explicitly and `box-sizing: border-box` globally.

---

## Scaling data, the failure mode to avoid

**Never express data as a percentage of a container whose width is not the axis maximum.** Doing so silently detaches the bars from the axis, and bars will cross a "limit" line that is supposed to stop them.

Instead pick an explicit px-per-unit ratio, put it in a comment, and compute every width from it:

```css
/* skala: 1 GB = 2.85 px  →  288 GB = 820 px */
:root { --bar-w: 820px; }
```

```html
<div class="seg weights" style="width:142px">50 GB</div>   <!-- 50 × 2.85 -->
<div class="seg ctx"     style="width:641px">225 GB</div>  <!-- 225 × 2.85 -->
```

Then a value that **exceeds** the budget renders honestly: fill the track to `--bar-w`, and let the overflow segment continue past it with a dashed accent border. That overflow is usually the most persuasive element on the slide, so do not clip it.

Axis ticks are absolutely positioned inside a `--bar-w`-wide strip using the same ratio, so ticks and bars can never drift apart.

---

## Anatomy that works

```
┌───────────────────────────────────────────────────────────┐
│ EYEBROW ─────────────────────────────────  mono, accent   │
│ Big title                                  48-50px, 800   │
│ One-line thesis                            20px, muted    │
│                                                           │
│      ┌ axis ticks ────────────────────┬ limit marker      │
│  lbl │████████ orange │░░ hatched ░░│▓│                   │  verdict
│  lbl │████████████████│░░░░░░░░░░░░│▓│                   │  verdict
│  lbl │███████████████████████████████│ ╌ overflow ╌       │  verdict
│                                                           │
│ ▌ Callout, the sentence nobody in the room has thought   │
│                                                           │
│ ─────────────────────────────────────────────────────────│
│ ■ legend  ▨ legend  ▩ legend        Rule of thumb: X = Y  │
└───────────────────────────────────────────────────────────┘
```

- **Eyebrow**: 2-3 words, mono, uppercase, accent, wide letter-spacing, with a hairline running to the right edge.
- **Title**: what the viewer is looking at, not a category label.
- **Thesis line**: the one sentence the graphic proves. Bold the operative clause.
- **Row labels**: right-aligned, big number on top, qualifier underneath in muted grey.
- **Verdict column**: a short judgement per row ("Sweet spot", "Nie mieści się"). This is what turns a chart into an argument.
- **Callout**: left accent border, one or two sentences. Reserve it for the non-obvious consequence.
- **Footer**: legend left, rule of thumb right in mono accent. A takeaway the audience can reuse without the slide beats any label.

Layout with flexbox: `body` is a column, footer gets `margin-top: auto`. If the middle looks empty, the callout is doing too little, so say more there rather than stretching the bars.

---

## Wiring it into the slide

Reference the PNG from `deck.md` like any image:

```markdown
## Section Label

### What the graphic answers

![Descriptive alt text](attachments/gpu-memory.png)

> _Notatka prowadzącego:_ …
```

**Keep the slide `full-image`.** `detectLayout()` in `src/lib/deck-parser.ts` picks `full-image` only when, after stripping the `#`/`##` headings and the image, **at most one** meaningful line remains (and `###` counts as a heading line). Add one line of body text and the slide flips to `two-column`, dropping the graphic to half width and making it unreadable.

So a caption or a source **must live inside the `### H3`**:

```markdown
### Cały ranking · [artificialanalysis.ai](https://artificialanalysis.ai/#intelligence)
```

Everything else (the numbers to point at, what to say, what to skip) belongs in the speaker note.

---

## Workflow

1. Decide the graphic earns its place. Markdown table or Mermaid first; this skill when neither can express it.
2. Copy `template.html` into `decks/<deck>/<name>.html` and rename.
3. Fix the scale ratio in the CSS comment, then derive every width from it.
4. Render with the Chrome command above into `attachments/<name>.png`.
5. **Read the PNG back and look at it.** This is not optional, every defect below was found this way, not by reading the HTML.
6. Fix, re-render, look again. Two or three passes is normal.
7. Add the image to `deck.md`, keeping the slide `full-image`.
8. Confirm it serves: `curl -o /dev/null -w "%{http_code}" http://localhost:3000/api/decks/<deck>/attachments/<name>.png`

### Visual review checklist

Check these on the rendered PNG, not in the markup:

- [ ] Do bars stop exactly at the limit line, and does overflow visibly pass it?
- [ ] Does any axis tick collide with a limit-line label? Drop the tick, because the marker matters more.
- [ ] Are limit-line labels overlapped by the bars? Anchor them above the plot, `right: -2px` off the line.
- [ ] Is there dead vertical space? Fill it with a callout, not with taller bars.
- [ ] Does any label sit half-outside its segment because the segment is too narrow? Move it out or drop it, since the legend covers it.
- [ ] Is orange used for exactly one idea?
- [ ] Readable at arm's length when the image is scaled to a laptop screen?
