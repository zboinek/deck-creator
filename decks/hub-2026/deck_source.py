#!/usr/bin/env python3
"""Parser deck.md - wspolne zrodlo dla build-deck.py (HTML/PDF) i build-pptx.py (PowerPoint).

Oba buildy MUSZA czytac deck.md przez ten modul. Dwa niezalezne parsery rozjechalyby
sie po pierwszej zmianie skladni i ten sam deck wygladalby inaczej w PDF i w PPT.

Wyjscie: lista Slide. Tresc slajdu to lista blokow, blok to lista Spanow.
Span trzyma surowy tekst (moze zawierac \\n) plus flagi formatowania, wiec kazdy
renderer sam decyduje, czy \\n to <br>, czy zlamanie linii w polu tekstowym.
"""
import re, html, pathlib
from dataclasses import dataclass, field

NOTE = re.compile(r'^>\s*_(?:Notatka prowadzącego|Note|Speaker note):_\s*', re.I)
IMG  = re.compile(r'!\[([^\]]*)\]\(([^)]+)\)')

# ---------- span ----------

@dataclass
class Span:
    text: str
    bold: bool = False
    italic: bool = False
    code: bool = False
    href: str | None = None

_CODE   = re.compile(r'`([^`]+)`')
_STRONG = re.compile(r'\*\*([^*]+)\*\*')
_EM     = re.compile(r'(?<!\*)\*([^*]+)\*(?!\*)')
_LINK   = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')

def spans(text, **inherit):
    """Tokenizuje inline markdown na Spany. Kolejnosc prob (code, strong, em, link)
    odwzorowuje kolejnosc podstawien z pierwotnej wersji build-deck.py."""
    out, pos = [], 0
    while pos < len(text):
        best = None
        for rx, kind in ((_CODE, 'code'), (_STRONG, 'bold'), (_EM, 'italic'), (_LINK, 'link')):
            m = rx.search(text, pos)
            if m and (best is None or m.start() < best[0].start()):
                best = (m, kind)
        if best is None:
            out.append(Span(text[pos:], **inherit)); break
        m, kind = best
        if m.start() > pos:
            out.append(Span(text[pos:m.start()], **inherit))
        if kind == 'link':
            out.extend(spans(m.group(1), **{**inherit, 'href': m.group(2)}))
        elif kind == 'code':
            out.append(Span(m.group(1), **{**inherit, 'code': True}))
        else:
            out.extend(spans(m.group(1), **{**inherit, kind: True}))
        pos = m.end()
    return [s for s in out if s.text]

def spans_to_html(ss):
    parts = []
    for s in ss:
        t = html.escape(s.text, quote=False).replace('\n', '<br>')
        if s.code:   t = f'<code>{t}</code>'
        if s.bold:   t = f'<strong>{t}</strong>'
        if s.italic: t = f'<em>{t}</em>'
        if s.href:   t = f'<a href="{s.href}">{t}</a>'
        parts.append(t)
    return ''.join(parts)

def plain(ss):
    return ''.join(s.text for s in ss)

# ---------- bloki ----------

@dataclass
class Block:
    kind: str                       # 'p' | 'ul' | 'ol' | 'table'
    spans: list = field(default_factory=list)   # dla 'p'
    items: list = field(default_factory=list)   # dla 'ul'/'ol' - lista list Spanow
    head:  list = field(default_factory=list)   # dla 'table'
    rows:  list = field(default_factory=list)   # dla 'table'
    cls:   str = ''                 # dla 'p': '' | 'lede' | 'ask'

def blocks(md):
    out, i = [], 0
    lines = md.split('\n')
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1; continue

        if ln.lstrip().startswith('|'):
            tbl = []
            while i < len(lines) and lines[i].lstrip().startswith('|'):
                tbl.append(lines[i].strip()); i += 1
            cells = lambda r: [c.strip() for c in r.strip('|').split('|')]
            out.append(Block('table',
                             head=[spans(c) for c in cells(tbl[0])],
                             rows=[[spans(c) for c in cells(r)] for r in tbl[2:]]))
            continue

        m_ul = re.match(r'^-\s+(.*)$', ln)
        m_ol = re.match(r'^\d+\.\s+(.*)$', ln)
        if m_ul or m_ol:
            pat = r'^-\s+(.*)$' if m_ul else r'^\d+\.\s+(.*)$'
            items = []
            while i < len(lines) and re.match(pat, lines[i]):
                items.append(spans(re.match(pat, lines[i]).group(1))); i += 1
            out.append(Block('ul' if m_ul else 'ol', items=items))
            continue

        para = []
        while i < len(lines) and lines[i].strip() and not lines[i].lstrip().startswith('|') \
              and not re.match(r'^(-|\d+\.)\s+', lines[i]):
            para.append(lines[i].rstrip()); i += 1
        joined = '\n'.join(para)
        one = joined.strip()
        if len(para) == 1 and re.fullmatch(r'\*\*[^*]+\*\*', one) and one.rstrip('*').rstrip().endswith('?'):
            cls = 'ask'          # pytanie zostawione sali bez odpowiedzi
        elif len(para) == 1 and one.startswith('*'):
            cls = 'lede'
        else:
            cls = ''
        out.append(Block('p', spans=spans(joined), cls=cls))
    return out

def blocks_to_html(md):
    out = []
    for b in blocks(md):
        if b.kind == 'table':
            th = ''.join(f'<th>{spans_to_html(c)}</th>' for c in b.head)
            tr = ''.join('<tr>' + ''.join(f'<td>{spans_to_html(c)}</td>' for c in r) + '</tr>'
                         for r in b.rows)
            out.append(f'<table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table>')
        elif b.kind in ('ul', 'ol'):
            li = ''.join(f'<li>{spans_to_html(x)}</li>' for x in b.items)
            out.append(f'<{b.kind}>{li}</{b.kind}>')
        else:
            cls = f' class="{b.cls}"' if b.cls else ''
            out.append(f'<p{cls}>{spans_to_html(b.spans)}</p>')
    return '\n'.join(out)

# ---------- slajdy ----------

@dataclass
class Slide:
    index: int
    eyebrow: str | None     # ## - nadtytul
    title: str | None       # ### - tytul slajdu
    big: str | None         # #  - wielki naglowek (tytulowy/koncowy)
    text: str               # tresc bez naglowkow i obrazkow
    imgs: list              # [(alt, src, width|None)]
    notes: str              # notatka prowadzacego (pomijana w HTML, uzywana w PPTX)
    kind: str = 'text'      # title | closing | figure | split | text (+ sparse)
    sparse: bool = False

def _strip_width(alt):
    parts = alt.split('|')
    if len(parts) > 1 and re.fullmatch(r'\s*(\d+%|\d+px|auto)\s*', parts[-1]):
        return '|'.join(parts[:-1]).strip(), parts[-1].strip()
    return alt, None

def load(path=None):
    src = pathlib.Path(path) if path else pathlib.Path(__file__).parent / 'deck.md'
    body = src.read_text(encoding='utf-8').split('---', 2)[2]
    chunks = [c.strip() for c in re.split(r'\n---\n', body) if c.strip()]

    slides = []
    for n, c in enumerate(chunks, 1):
        keep, note, inn = [], [], False
        for l in c.split('\n'):
            if NOTE.match(l):
                inn = True; note.append(NOTE.sub('', l).rstrip('_'))
            elif inn and l.startswith('>'):
                note.append(l.lstrip('>').strip().rstrip('_'))
            else:
                inn = False; keep.append(l)
        txt = '\n'.join(keep)

        h1 = re.search(r'(?m)^#\s+(.+)$', txt)
        h2 = re.search(r'(?m)^##\s+(.+)$', txt)
        h3 = re.search(r'(?m)^###\s+(.+)$', txt)
        rest = re.sub(r'(?m)^#{1,3}\s+.*$', '', txt)

        imgs = [(_strip_width(a)[0], s, _strip_width(a)[1]) for a, s in IMG.findall(rest)]
        slides.append(Slide(
            index   = n,
            eyebrow = h2.group(1).strip() if h2 else None,
            title   = h3.group(1).strip() if h3 else None,
            big     = h1.group(1).strip() if h1 else None,
            text    = IMG.sub('', rest).strip(),
            imgs    = imgs,
            notes   = '\n'.join(x for x in note if x).strip(),
        ))

    total = len(slides)
    for s in slides:
        has_text = bool(re.sub(r'\s', '', s.text))
        if s.index == 1:              s.kind = 'title'
        elif s.index == total:        s.kind = 'closing'
        elif s.imgs and not has_text: s.kind = 'figure'
        elif s.imgs and has_text:     s.kind = 'split'
        else:                         s.kind = 'text'
        s.sparse = s.kind == 'text' and len(re.sub(r'\s', '', s.text)) < 110
    return slides
