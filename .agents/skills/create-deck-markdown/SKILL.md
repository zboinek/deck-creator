---
name: create-deck-markdown
description: >-
  Create and adapt Markdown slide decks for the Deck Creator app. Use when the
  user asks to create a presentation, slide deck, or convert existing content
  into slides, or mentions deck.md, decks folder, or Deck Creator.
---

# Create Deck Markdown

This skill produces `deck.md` files compatible with the Deck Creator application — a Next.js presentation engine that parses Markdown into interactive slide decks with PDF export.

## File & Folder Convention

```
decks/
  <deck-name>/
    deck.md                 # required — the slide content
    attachments/            # optional — images and assets
      diagram.png
      photo.jpg
```

- The folder name becomes the URL slug (`/deck/<deck-name>`).
- Use lowercase-kebab-case for folder names: `my-talk`, `ai-lecture-04`.
- The file **must** be named `deck.md`.

---

## Frontmatter (YAML)

Every deck starts with YAML frontmatter:

```yaml
---
title: "Your Deck Title"
date: 2026-03-22
author: "Author Name"
description: "One-line summary shown on the home page"
---
```

| Field         | Required | Notes                                        |
|---------------|----------|----------------------------------------------|
| `title`       | No*      | Falls back to the first `# H1` in content    |
| `date`        | No       | ISO format (`YYYY-MM-DD`). Used for sorting   |
| `author`      | No       | Displayed in metadata                         |
| `description` | No       | Shown on the deck listing page                |

*If `title` is missing from frontmatter, the parser extracts it from the first `# H1` heading.

---

## Slide Separation

Slides are separated by a horizontal rule — three dashes on their own line with blank lines around them:

```markdown
Content of slide 1

---

Content of slide 2
```

The separator **must** be `---` on a line by itself, surrounded by blank lines. Do NOT use `***` or `___`.

---

## Heading Hierarchy — Critical Rules

The parser treats headings specially. Understanding this is essential:

| Heading | Behaviour |
|---------|-----------|
| `# H1`  | **Stripped from slide.** Used only as deck title extraction (first occurrence). Never renders on-screen. |
| `## H2` | **Stripped from body, displayed in top-left chrome** of the slide shell as the slide's heading label. Only the first `## H2` per slide is used. |
| `### H3` | Renders normally as a large subheading inside the slide body. |
| `#### H4` | Renders normally as a medium subheading. |

**Practical pattern for a typical slide:**

```markdown
## Slide Heading Shown in Corner

### Body Title Rendered Big

- Bullet point one
- Bullet point two

Some paragraph text explaining the concept.
```

- Use `## H2` once per slide as a structural label.
- Use `### H3` for the main visible title within the slide body.
- Avoid `# H1` except on the very first slide (used only for title fallback).

---

## Auto-Detected Layouts

The parser automatically selects one of three layouts based on content:

### 1. `default` — Text Only

Triggered when the slide has **no images**. Content is centered, max-width constrained.

```markdown
## Architecture Overview

### Three-Tier Model

1. **Presentation layer** — React components
2. **Business logic** — server actions
3. **Data layer** — Postgres via Prisma
```

### 2. `full-image` — Image with Optional Heading

Triggered when the slide has **an image and at most a heading** (no substantial text body).

```markdown
## System Diagram

![Architecture overview](attachments/architecture.png)
```

The image fills the available slide area. Use this for diagrams, photos, screenshots.

### 3. `two-column` — Text Left, Image Right

Triggered when the slide has **both an image AND substantial text** (more than just a heading).

```markdown
## Key Metrics

### Our Growth in 2025

- Revenue grew **42%** year-over-year
- User base expanded to **1.2M** active users
- NPS score improved from 34 to 61

![Growth chart](attachments/growth_chart.png)
```

The text renders on the left half, the image on the right half.

### 4. `two-column-text` — Side-by-Side Text Columns

Triggered by placing a `<!-- columns -->` HTML comment in the slide body. Content **before** the marker becomes the left column, content **after** becomes the right column. A subtle vertical divider separates them.

```markdown
## Comparison

### Option A

- Fast prototyping
- Lower cost
- Limited scale

<!-- columns -->

### Option B

- Production-grade
- Higher investment
- Unlimited scale
```

Use this layout for comparisons, pros/cons, or any content that benefits from side-by-side presentation. Works with any markdown content (headings, lists, blockquotes, code blocks, etc.).

---

## Images

Place image files in the `attachments/` subfolder and reference them with standard Markdown syntax:

```markdown
![Alt text](attachments/filename.png)
```

**Image Resizing:**
You can manually scale an image by appending ` | <size>` to the alt text.
Supported formats: percentages (`50%`), pixels (`300px`), or `auto`.

```markdown
![Architecture diagram | 50%](attachments/diagram.png)
![Small icon | 150px](attachments/icon.png)
```

Rules:
- Relative paths starting with `attachments/` are resolved automatically.
- External URLs (`https://...`) work directly.
- Provide meaningful `alt` text — it is used for accessibility and as fallback.
- Prefer PNG or JPG. Keep file sizes reasonable for PDF export.

---

## Speaker Notes

Use a blockquote starting with a special italic prefix. Notes are hidden from the slide body and shown in a collapsible side panel (toggled with `N` key):

```markdown
> _Speaker note:_ This is important context for the presenter.
> It can span multiple lines as long as each continues the blockquote.
```

Accepted prefixes (case-insensitive):
- `> _Note:_`
- `> _Speaker note:_`
- `> _Notatka prowadzącego:_`

Speaker notes are stripped from rendered slide content and never appear in PDF export.

---

## Supported Markdown Features

The renderer supports GitHub-Flavored Markdown (GFM) with syntax highlighting:

| Feature | Syntax | Rendering |
|---------|--------|-----------|
| Bold | `**bold**` | Strong emphasis, full text color |
| Italic | `*italic*` | Styled italic, secondary color |
| Inline code | `` `code` `` | Monospace with accent background |
| Code blocks | ` ```lang ` | Syntax-highlighted, dark background |
| Unordered lists | `- item` | Disc bullets with spacing |
| Ordered lists | `1. item` | Numbered with spacing |
| Tables | GFM table syntax | Styled with header borders |
| Blockquotes | `> text` | Left accent border, italic |
| Links | `[text](url)` | Colored, underlined, opens in new tab |
| Images | `![alt](src)` | Responsive, rounded corners |
| Horizontal rules | `---` within a slide | Subtle divider line |

### Code Blocks

Use fenced code blocks with a language identifier for syntax highlighting:

````markdown
```python
def hello():
    print("Hello, world!")
```
````

---

## Content Density Guidelines

Each slide occupies the full viewport. Content is vertically and horizontally centered. Keep these limits in mind:

- **Max 5-7 bullet points** per slide. Beyond that, text overflows or becomes unreadably small.
- **Keep paragraphs to 2-3 sentences.** Slides are not documents.
- **One idea per slide.** Split dense topics across multiple slides.
- **Code blocks: max ~15 lines.** Longer code is unreadable at presentation scale.
- **Tables: max ~6 rows.** Large tables overflow the slide area.
- A deck of ~20-30 slides works well for a 45-60 min talk.

---

## Complete Slide Deck Example

```markdown
---
title: "Introduction to Reactive Systems"
date: 2026-03-22
author: "Jane Doe"
description: "Core principles of reactive architecture for modern applications"
---

# Introduction to Reactive Systems

---

## What Are Reactive Systems?

### The Reactive Manifesto

Systems that are:

1. **Responsive** — consistent response times
2. **Resilient** — stay responsive under failure
3. **Elastic** — stay responsive under load
4. **Message-driven** — async, non-blocking communication

> _Speaker note:_ Start by asking the audience what "reactive" means to them. Most will say "React.js" — use that as a segue.

---

## Architecture

![Reactive system architecture](attachments/reactive_arch.png)

---

## Event Sourcing

### Why Store Events, Not State?

- **Auditability** — full history of every change
- **Temporal queries** — reconstruct state at any point in time
- **Decoupling** — producers and consumers evolve independently

![Event sourcing flow](attachments/event_sourcing.png)

> _Speaker note:_ Use the bank account analogy: you don't store the balance, you store every transaction.

---

## Code Example

### A Simple Event Handler

```typescript
async function handleOrderPlaced(event: OrderPlacedEvent) {
  await inventory.reserve(event.items);
  await notifications.send(event.customerId, "Order confirmed");
  await analytics.track("order_placed", { total: event.total });
}
```

---

## Key Takeaways

### Start Small, Think Big

- Begin with message-driven communication between two services
- Add event sourcing where audit trails matter
- Scale elastically only when load patterns demand it

**Questions?**
```

---

## Workflow

1. Create folder `decks/<deck-name>/` and optionally `decks/<deck-name>/attachments/`.
2. Write `deck.md` with YAML frontmatter.
3. Structure content into slides separated by `---`.
4. Use `## H2` for slide labels, `### H3` for body titles.
5. Add images to `attachments/` and reference them in Markdown.
6. Add speaker notes with `> _Speaker note:_` prefix.
7. Keep each slide focused — one idea, limited bullet points.
8. Verify the deck renders by opening it in the app at `/deck/<deck-name>`.
