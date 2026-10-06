# Deck Creator

Silnik prezentacji: Next.js 15 (App Router, React 19) renderuje `decks/<slug>/deck.md`
jako interaktywny deck pod `/deck/<slug>`. Do tego druga, niezależna ścieżka:
statyczny render do PDF przez headless Chrome.

## Struktura decku

```
decks/<slug>/
  deck.md              # źródło - jedyne miejsce z treścią
  attachments/         # obrazki wstawiane do deck.md
  <nazwa>.html         # źródło infografiki (opcjonalnie)
  deck-print.css       # styl druku (opcjonalnie, per deck)
  build-deck.py        # deck.md -> deck-print.html
  build-pdf.sh         # build-deck.py + Chrome -> <Tytuł>.pdf
  fonts/               # TTF osadzane w PDF
```

Nazwa folderu = slug w URL-u. Plik **musi** nazywać się `deck.md`.
`deck-loader.ts` skanuje `decks/`, pomija katalogi bez poprawnego `deck.md`.

## Trzy ścieżki renderowania - nie mieszaj ich

| | Apka na żywo | Druk do PDF | PowerPoint |
|---|---|---|---|
| Wejście | `deck.md` | `deck.md` | `deck.md` |
| Parser | `deck-parser.ts` | `deck_source.py` | `deck_source.py` |
| Renderer | `react-markdown` | `build-deck.py` | `build-pptx.py` |
| Styl | `globals.css`, Tailwind 4 | `deck-print.css` | stałe w `build-pptx.py` |
| Font | Inter (web) | Inter (osadzony w PDF) | Arial (wszędzie obecny) |
| Uruchomienie | `npm run dev` | `./build-pdf.sh` | `./build-pptx.sh` |

**Apka ma własny parser w TypeScripcie, oba buildy pythonowe dzielą
`deck_source.py`.** Zmiana składni w decku może wyglądać dobrze w apce i rozjechać
się w buildach (albo odwrotnie). Po większej zmianie treści sprawdź oba wyjścia.

Skrypty są per-deck, nie globalne. `hub-2026` ma własny komplet dostrojony do
`deck-print.css` (1600x900, 33 slajdy). Nowy deck z eksportem = skopiuj
`deck_source.py`, `build-deck.py`, `build-pdf.sh`, `build-pptx.py`, `build-pptx.sh`,
`deck-print.css` i `fonts/` z `hub-2026`.

Po zmianie w `deck_source.py` sprawdź regresję HTML-a: `md5` pliku `deck-print.html`
przed i po musi się zgadzać, inaczej ruszyłeś ścieżkę PDF przy okazji.

## Infografiki

`MarkdownSlide.tsx` jedzie **bez `rehypeRaw`**, więc surowy HTML w `deck.md` jest po
cichu wyrzucany. Infografika = osobny plik `.html` obok `deck.md`, zrzucony do PNG
headless Chrome'em i wstawiony jako obrazek. Szczegóły i design system:
`.agents/skills/create-deck-infographic/`.

Zasada: `.html` to źródło (commitujemy), PNG w `attachments/` to dostawa (commitujemy).

## PowerPoint

```bash
cd decks/hub-2026
./build-pptx.sh              # -> Frontier-u-siebie.pptx
./build-pptx.sh --preview    # dodatkowo PNG każdego slajdu do preview/
```

Wymaga jednorazowo: `python3 -m venv .venv && .venv/bin/pip install python-pptx pillow`
w katalogu repo.

**Nie generuj PPTX z PDF-a.** Rozmiar tekstu koduje w tych deckach rolę slajdu
(tytułowy 118px, końcowy 96px, rzadki 64px, zwykły 41px, podpis rysunku 31px).
W PDF-ie ta informacja nie istnieje, zostają same glify, więc konwerter mapuje
każdy rozmiar dosłownie i typografia się rozjeżdża. Sprawdzone w praktyce:
struktura wychodzi znośnie, fonty i rozmiary nie.

Dlaczego to się składa łatwo:

```
12192000 EMU / 1600 px = 7620        6858000 EMU / 900 px = 7620
```

Slajd 1600x900 to równo 120 px/cal, czyli 16:9 PowerPointa co do EMU. Geometria
z `deck-print.css` przelicza się mnożeniem przez stałą, a rozmiary fontów przez
`pt = px * 0.85 (--fs) * 0.6`.

Zasady, które trzymają typografię w ryzach:

- **Arial, nie Inter.** Inter musiałby być zainstalowany na maszynie prezentującej
  albo osadzony (Mac PowerPoint bywa z tym zawodny). Arial jest wszędzie, więc
  PowerPoint niczego nie podmieni. Bonus: Arial jest ~7% węższy od Intera, więc
  tekst, który mieścił się w PDF, zmieści się i tu.
- **Sztywne rozmiary, zero autofitu.** Autofit PowerPointa zmniejsza tekst per
  slajd i przywraca dokładnie ten bałagan, którego unikamy. Zamiast tego
  `build-pptx.py` mierzy tekst metrykami Arialu i **głośno krzyczy**, który slajd
  się nie mieści. Wtedy skraca się treść w `deck.md`, nie zmniejsza font.
- **`\n` w akapicie to `<a:br/>`**, nie goły znak w `<a:t>`. W CSS to `<br>`;
  w OOXML goły `\n` nie jest złamaniem i PowerPoint go zjada.

`preview-pptx.py` rasteryzuje gotowy `.pptx` do PNG, czytając pozycje, rozmiary,
kolory i obramowania z zapisanego XML-a. To kontrola tego, co naprawdę wylądowało
w pliku. **To nie jest renderer PowerPointa** - dowodzi poprawności zawartości
i braku wyjścia poza ramkę, nie identyczności co do piksela.

## Czego nie commitujemy

Patrz `.gitignore`. W skrócie:

- `deck-print.html`, `*.pdf`, `*.pptx`, `preview/` w `decks/` - artefakty,
  odtwarzalne przez `./build-pdf.sh` i `./build-pptx.sh`
- `.venv/` - środowisko Pythona dla buildu PPTX
- `build-docker.sh` - zawiera adres serwera i usera SSH, celowo tylko lokalnie
- `*.bkp` - od tego jest git
- surowce (screeny źródłowe, pptx-y, PDF-y referencyjne) - **trzymaj poza repo**.
  Katalog `resources/` w `hub-2026` urósł do 55 MB duplikatów, zanim go usunięto.
  Do `attachments/` trafia tylko to, co deck faktycznie wyświetla.

Historia gita waży ~125 MB przez duże PNG/GIF z wcześniejszych decków
(`letta-code-demo.gif` ma 31 MB). Kompresuj obrazki **przed** commitem.

## Deploy

**CI/CD (podstawowa ścieżka):** push na `main` odpala `.github/workflows/deploy.yml`.
Build obrazu i push do `ghcr.io/zboinek/deck-creator` robi Actions tokenem
`GITHUB_TOKEN` (tagi `latest` + SHA), potem rsync `decks/` na serwer **z `--delete`**
(serwer = lustrzane odbicie repo w `decks/`; lokalne surowce i artefakty
z serwera znikają) i `docker compose pull && up -d` przez SSH.
Endpoint serwera siedzi w sekretach `SSH_HOST/SSH_PORT/SSH_USER/
SSH_PRIVATE_KEY/SSH_KNOWN_HOSTS` (klucz dedykowany, `deck-creator-ci-deploy`,
odwoływalny w `authorized_keys`). Pakiet na ghcr jest **prywatny**: każdy deploy
loguje dockerem serwer krótkożywym `GITHUB_TOKEN` joba (ważnym ~1 h) tuż przed
`compose pull`, więc na serwerze nie ma żadnego trwałego tokenu rejestru.
Ręczny restart/pull na serwerze bez CI wymaga własnego `docker login ghcr.io`.

**Ręczny fallback:** `./build-docker.sh --deploy` (lokalny build + push + scp
decków + restart compose). `--sync-decks` sam wysyła decki bez przebudowy obrazu.

Kontener montuje `decks/` read-only, więc sama treść aktualizuje się
przez rsync bez rebuildu obrazu.

**Gate bezpieczeństwa w CI:** przed buildem leci `npm audit --audit-level=high`
(podatności zależności JS z lockfile'a), po pushu Trivy skanuje obraz
(`severity: HIGH,CRITICAL`, `ignore-unfixed: true`). FAIL któregokolwiek
blokuje deploy - stary obraz dalej działa na serwerze. Odpalamy na
Node 24 LTS (aktualne LTS w Dockerfile i `@types/node`).

## Skille

- `create-deck-markdown` - format `deck.md`, layouty, notatki prowadzącego
- `create-deck-infographic` - HTML -> PNG, paleta, typografia

## Konwencje treści

- Notatki prowadzącego: `> _Notatka prowadzącego:_ ...` (wycinane z obu renderów)
- Slajdy rozdziela `---` w osobnej linii, z pustymi liniami wokół
- **Bez em dashy (—) w treści slajdów.** Sprawdź `grep -c '—'` przed renderem.
