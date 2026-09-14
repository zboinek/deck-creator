#!/usr/bin/env python3
"""Renderuje deck.md do jednego HTML-a 1600x900/slajd, gotowego do druku w PDF.
Tresc pochodzi wylacznie z deck.md; ten skrypt tylko ja sklada.
Parsowanie siedzi w deck_source.py, wspolnym z build-pptx.py."""
import html, pathlib
import deck_source as ds

HERE = pathlib.Path(__file__).parent
OUT  = HERE / "deck-print.html"

def h(s):
    return ds.spans_to_html(ds.spans(s))

pages = []
slides = ds.load()

for s in slides:
    eb  = f'<div class="eyebrow"><span>{h(s.eyebrow)}</span><i></i></div>' if s.eyebrow else ''
    ttl = f'<h2>{h(s.title)}</h2>' if s.title else ''
    body = ds.blocks_to_html(s.text)

    if s.kind == 'title':
        pages.append(f'''<section class="slide title">
  <div class="t-inner">
    <div class="kicker">{h(s.title or '')}</div>
    <h1>{h(s.big or '')}</h1>
    <div class="t-body">{body}</div>
  </div>
  <div class="t-rule"></div>
</section>''')

    elif s.kind == 'closing':
        pages.append(f'''<section class="slide closing">
  <div class="c-inner">
    <div class="kicker">{h(s.title or '')}</div>
    <h1>{h(s.eyebrow or '')}</h1>
    <div class="c-body">{body}</div>
  </div>
</section>''')

    elif s.kind == 'figure':
        alt, src, _ = s.imgs[0]
        own = (HERE / (pathlib.Path(src).stem + '.html')).exists()
        head = f'<header class="thin">{eb}</header>' if own else f'<header>{eb}{ttl}</header>'
        pages.append(f'''<section class="slide figure">
  {head}
  <div class="fig"><img src="{src}" alt="{html.escape(alt)}"></div>
  <div class="pnum">{s.index}</div>
</section>''')

    elif s.kind == 'split':
        alt, src, _ = s.imgs[0]
        # w druku o rozmiarze decyduje wysokosc kolumny, nie podpowiedz z markdownu
        pages.append(f'''<section class="slide">
  <header>{eb}{ttl}</header>
  <div class="split">
    <div class="col-text">{body}</div>
    <div class="col-img"><img src="{src}" alt="{html.escape(alt)}"></div>
  </div>
  <div class="pnum">{s.index}</div>
</section>''')

    else:
        pages.append(f'''<section class="slide{' sparse' if s.sparse else ''}">
  <header>{eb}{ttl}</header>
  <div class="body">{body}</div>
  <div class="pnum">{s.index}</div>
</section>''')

CSS = (HERE / "deck-print.css").read_text(encoding='utf-8')
OUT.write_text(f'''<!doctype html>
<html lang="pl"><head><meta charset="UTF-8"><title>Frontier u siebie</title>
<style>{CSS}</style></head><body>
{chr(10).join(pages)}
</body></html>''', encoding='utf-8')
print(f"{len(slides)} slajdów -> {OUT.name}")
