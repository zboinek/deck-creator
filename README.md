# deck-creator

Prezentacje pisane w Markdownie. Next.js renderuje je jako interaktywny deck
z synchronizacją sesji, a headless Chrome składa z tego samego źródła PDF do druku.

## Szybki start

```bash
npm install
npm run dev          # http://localhost:3000
```

Strona główna listuje wszystkie decki z `decks/`. Pojedynczy deck: `/deck/<slug>`.

## Nowy deck

```bash
mkdir -p decks/moj-deck/attachments
```

Utwórz `decks/moj-deck/deck.md`:

```markdown
---
title: "Tytuł"
date: 2026-09-14
author: "Jakub Zboina"
description: "Jedno zdanie na stronę główną"
---

### Nadtytuł

# Pierwszy slajd

> _Notatka prowadzącego:_ widoczna tylko dla prowadzącego.

---

## Drugi slajd

Treść.
```

Slajdy rozdziela `---` w osobnej linii. Obrazki wstawiaj z `attachments/`.

## Sterowanie prezentacją

| Klawisz | Akcja |
|---|---|
| `→` / `spacja` | następny slajd |
| `←` | poprzedni slajd |
| `Home` / `End` | pierwszy / ostatni slajd |
| `N` | notatki prowadzącego |
| `T` | motyw jasny / ciemny |

Prowadzący może otworzyć sesję i sterować slajdami na urządzeniach widzów.
Widzowie wchodzą na `/join` i wpisują 6-znakowy kod pokazany na ekranie prowadzącego.

## Eksport do PDF

Decki przygotowane do druku mają własny `build-pdf.sh`:

```bash
cd decks/hub-2026
./build-pdf.sh       # -> Frontier-u-siebie.pdf, 1600x900, fonty osadzone
```

Wymaga Google Chrome i `pdfinfo` (`brew install poppler`).
Gotowy PDF nie trafia do repo - odtwarzasz go tym skryptem.

## Eksport do PowerPointa

```bash
python3 -m venv .venv && .venv/bin/pip install python-pptx pillow   # raz

cd decks/hub-2026
./build-pptx.sh              # -> Frontier-u-siebie.pptx, 16:9, z notatkami
./build-pptx.sh --preview    # dodatkowo PNG każdego slajdu do preview/
```

Generowane wprost z `deck.md`, nie z PDF-a, dzięki czemu rozmiary tekstu są stałe
w obrębie typu slajdu, a nie odtwarzane z glifów. Tekst zostaje edytowalny,
font to Arial (obecny na każdej maszynie), notatki prowadzącego trafiają do panelu
notatek. Poprawki treści robisz w `deck.md` i przebudowujesz.

## Deploy

Push na `main` odpala GitHub Actions (`.github/workflows/deploy.yml`):
build obrazu + push do ghcr, rsync `decks/` na serwer, restart compose,
weryfikacja HTTP. Ręczny fallback: `./build-docker.sh --deploy` (build lokalny).
Sekrety CI: `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`.

## Dalej

`CLAUDE.md` opisuje architekturę, obie ścieżki renderowania i pułapki.
