# Po drugiej stronie modelu. Jak zbudować dobry harness

Gotowy scenariusz dla jednego lektora: [podcast.txt](podcast.txt). Plik zawiera wyłącznie tekst do przeczytania — bez przypisów, znaczników czasu, didaskaliów i instrukcji realizacyjnych.

**Długość:** 3891 słów, 30 043 znaki ze spacjami i znakami końca linii. Przy średnim tempie 130 słów na minutę, liczonym wraz z pauzami, daje to około **29 minut 56 sekund**. Przy 125–135 słowach na minutę: około **28:49–31:08**. To estymacja tekstowa; nie wygenerowano i nie zmierzono nagrania.

**Forma:** spokojny dokument popularnonaukowy, jeden narrator, stopniowo rosnąca szczegółowość. Wspólny przykład firmowego raportu łączy kolejne zagadnienia. Odbiorca nie musi znać projektu Harness ani wcześniejszych wykładów. Ton nawiązuje do tradycji polskiej narracji dokumentalnej i radiowej, bez kopiowania konkretnej audycji lub lektora.

**Stan materiału:** opracowanie ukończone 1 listopada 2026. Wykorzystano cztery wykłady o agentach, odczyt dokumentacji i wybranych modułów `../harness` oraz źródła pierwotne dostępne podczas pracy. Przegląd Harnessu obejmował lokalne drzewo robocze na bazie commitu `11f5571`, także istniejące zmiany niezatwierdzone i pliki eksperymentalnego planowania. Nie jest to ocena wyłącznie tego commitu. Nie modyfikowano projektu Harness, nie uruchamiano jego usług, testów ani płatnych eksperymentów. Oceny implementacji wynikają z odczytu kodu, a liczby benchmarku z istniejących artefaktów.

## Orientacyjny przebieg

Czasy wynikają z liczby słów i średniego tempa 130 słów na minutę. Nie są znacznikami gotowego audio.

| Początek | Temat |
|---|---|
| 00:00 | Scena otwierająca, model i sześć obowiązków harnessu |
| 03:00 | Kontrakt zadania i zakres autonomii |
| 04:27 | Pętla, jawne stany, budżety i powtórzenia |
| 06:23 | Projektowanie narzędzi, informacja zwrotna i MCP |
| 08:22 | Kontekst, pamięć, kompakcja i trwałość ograniczeń |
| 10:48 | Tożsamość, wstrzykiwanie instrukcji, zgody i sandbox |
| 12:46 | Awaria, wznowienie, idempotencja i niepewny skutek |
| 15:18 | Weryfikacja rezultatu i mylące znaczenie „ukończone” |
| 17:54 | Ewaluacja, powtarzalność, koszt sukcesu i awarie |
| 20:36 | Eksperyment z planowaniem i granice delegowania |
| 22:36 | Ocena backendu, zdarzenia i diagnoza problemów |
| 25:12 | Koszt, adaptery, współbieżność i postęp pracy |
| 27:13 | Kolejność budowy, skille, wdrażanie i finał |
| 29:56 | Szacowany koniec |

## Co wynika z kodu Harnessu

Rekomendacje w scenariuszu są syntezą autora opracowania. Poniżej oddzielono obserwacje implementacji od proponowanych zmian. Nie traktujemy obecności zabezpieczenia w kodzie jako potwierdzenia jego poprawnego wdrożenia w działającym środowisku.

| Obszar | Obserwacja i ocena | Podstawa |
|---|---|---|
| Rdzeń i orkiestracja | Czyste `decide`/`evolve` oddzielono od operacji zewnętrznych. To mocna podstawa testowania reguł sterowania. | [core.py](/Users/Jakub.Zboina/dev/harness/src/harness/agent/core.py:330), [workflow.py](/Users/Jakub.Zboina/dev/harness/src/harness/agent/workflow.py:1) |
| Znaczenie ukończenia | Limit tur prowadzi w jednej ścieżce do `CompleteRun`; `evolve` nadaje status `completed`. Komunikat uczciwie informuje o braku końcowej odpowiedzi. Ryzyko dotyczy utożsamienia statusu procesu z sukcesem zadania. Propozycja: oddzielić status wykonania i ocenę rezultatu. | [Obsługa limitu](/Users/Jakub.Zboina/dev/harness/src/harness/agent/core.py:375), [zmiana stanu](/Users/Jakub.Zboina/dev/harness/src/harness/agent/core.py:744), [istniejący test](/Users/Jakub.Zboina/dev/harness/tests/test_core.py:79) |
| Weryfikacja | Odpowiedź bez wywołań narzędzi przechodzi do `_complete_or_ask`. Funkcja uruchamia wymagane zatwierdzenie albo kończy przebieg. Nie jest ogólnym weryfikatorem spełnienia zadania. Propozycja: kontrakty i weryfikatory dobrane do domeny. | [Zakończenie odpowiedzi](/Users/Jakub.Zboina/dev/harness/src/harness/agent/core.py:371), [bramka końcowa](/Users/Jakub.Zboina/dev/harness/src/harness/agent/core.py:628) |
| Powtórzenia | `_repeat_notice` emituje informację o identycznym narzędziu i skrócie argumentów. To obserwacja powtórzeń, nie mechanizm samodzielnie przerywający pętle. Propozycja: reakcja zależna od błędu i postępu. | [Rejestrowanie powtórzeń](/Users/Jakub.Zboina/dev/harness/src/harness/agent/core.py:524) |
| Kompakcja | Streszczenie jest uzupełniane wybranymi dosłownymi wiadomościami użytkownika. `PINNED_SHARE` ogranicza je do części okna, więc nie jest to gwarancja zachowania wszystkich zakazów. Propozycja: ograniczenia wykonawcze i zgody egzekwować ze strukturalnego stanu. | [Budżet wiadomości](/Users/Jakub.Zboina/dev/harness/src/harness/agent/context.py:41), [wybór i skracanie](/Users/Jakub.Zboina/dev/harness/src/harness/agent/context.py:182) |
| Dostęp do wiedzy | Kontrola korzysta z tożsamości pytającego; decyzje są cache'owane. Domyślne `access_cache_s` to 300 sekund. Scenariusz nie obiecuje natychmiastowego cofnięcia każdego dostępu. | [Kontrola i cache](/Users/Jakub.Zboina/dev/harness/src/harness/knowledge.py:255), [konfiguracja](/Users/Jakub.Zboina/dev/harness/src/harness/tenants.py:148) |
| Skutki zewnętrzne | `WRITE_RETRY` ogranicza ponawianie czynności zapisu do jednej próby. Zmniejsza ryzyko duplikacji przez retry infrastrukturalne, ale nie rozstrzyga niepewnego skutku ani ponownego zlecenia przez model. Propozycja: odpytywanie stanu operacji i idempotencja tam, gdzie wspiera ją źródło. | [Polityka zapisu](/Users/Jakub.Zboina/dev/harness/src/harness/agent/workflow.py:69), [jej użycie](/Users/Jakub.Zboina/dev/harness/src/harness/agent/workflow.py:301) |
| Sandbox | Konfiguracja wykonania obejmuje izolację, ograniczenia zasobów i blokadę sieci. Opis podcastu dotyczy założonej konfiguracji; nie wykonano testu działającego wdrożenia. | [Sandbox](/Users/Jakub.Zboina/dev/harness/src/harness/connectors/sandbox.py:1) |
| Koszt | Projekt ma metryki tokenów i koszt wyliczany według cennika. Propozycja dodania twardego budżetu i rezerwacji przed równoległymi wywołaniami jest zaleceniem produktowym; pomiar kosztu po fakcie pełni inną funkcję. | [Wycena](/Users/Jakub.Zboina/dev/harness/src/harness/processor.py:87), [metryki](/Users/Jakub.Zboina/dev/harness/src/harness/metrics.py:34) |
| Skille i organizacja | Promocja prywatnych procedur obejmuje skanowanie i recenzję. To użyteczny przykład zarządzania zmianą zachowania agentów. | [Opis mechanizmów](/Users/Jakub.Zboina/dev/harness/MECHANIZMY.md) |

Najważniejsza rekomendacja: zachować fundament trwałego wykonania i tożsamości; priorytet nadać kontraktom rezultatu, miarodajnej ewaluacji i semantyce zakończenia. Nie ma danych pozwalających ogłosić tę architekturę uniwersalnie najlepszą. Jej koszt operacyjny należy porównać z wymaganiami konkretnego produktu.

### Zastrzeżenie do benchmarku planowania

Historyczny pomiar obejmował cztery scenariusze i po trzy próby na wariant, łącznie 24 przebiegi. Dla 12 przebiegów zwykłej pętli zapisano 23 225 tokenów i 35 wywołań modelu; dla planowania 55 764 tokeny i 36 wywołań. To liczby z [opisu eksperymentu](/Users/Jakub.Zboina/dev/harness/PLAN-WYKONANIA.md:101), nie nowy pomiar.

Ten sam dokument wyraźnie mówi, że starszy adapter pomijał powód zatrzymania planu. Wyniki nie stanowią poprawnego porównania zamierzonego replanningu ani oceny kodu po poprawce. Dlatego podcast wykorzystuje je jako przykład pracy z hipotezą i wadliwym eksperymentem, a nie dowód, że planowanie szkodzi. Nie utożsamia tokenów z kosztem pieniężnym. Dodatkowe ograniczenia opisano w [przeglądzie benchmarku](/Users/Jakub.Zboina/dev/harness/benchmarks/planning-opus-review-2026-10-25.md).

## Wykłady i źródła zewnętrzne

Punktem wyjścia są: [anatomia harnessu](/Users/Jakub.Zboina/dev/deck-creator/decks/agenci-01-anatomia-harnessu/deck.md), [narzędzia i MCP](/Users/Jakub.Zboina/dev/deck-creator/decks/agenci-02-narzedzia-mcp/deck.md), [pamięć i kontekst](/Users/Jakub.Zboina/dev/deck-creator/decks/agenci-03-pamiec-kontekst/deck.md) oraz [planowanie i ewaluacja](/Users/Jakub.Zboina/dev/deck-creator/decks/agenci-04-planowanie-ewaluacja/deck.md). Zachowano rozróżnienie wyniku, procesu i powtarzalności; nie przedstawiono liczb z dydaktycznych przykładów slajdów jako badań empirycznych.

Poniższa mapa wskazuje, które twierdzenia z narracji wspierają publikacje. Pozostałe przykłady, kolejność wdrażania i zalecenia architektoniczne są autorską syntezą oraz analizą lokalnego projektu.

- **Otwarcie:** wzrost 52,8% → 66,5% w Terminal-Bench 2.0 przy niezmienionym modelu pochodzi z raportu autorów eksperymentu. W tekście wartości zaokrąglono dla wygody słuchania; nie przeniesiono wyniku na inne zastosowania. [LangChain, Improving Deep Agents with harness engineering, 17.02.2026](https://www.langchain.com/blog/improving-deep-agents-with-harness-engineering).
- **Zakres autonomii:** rozróżnienie ustalonych workflow i agentów dynamicznie wybierających kroki oraz zalecenie rozpoczynania od prostych rozwiązań. [Anthropic, Building effective agents, 19.12.2024](https://www.anthropic.com/research/building-effective-agents).
- **Interfejs narzędzi:** eksperymentalne uzasadnienie projektowania agent-computer interface. Nie przenosimy historycznych wyników konkretnych okien podglądu plików na aktualne modele. [Yang i in., SWE-agent, 2024](https://arxiv.org/abs/2405.15793).
- **Kontrakty narzędzi:** opisy, nazwy, użyteczność informacji zwrotnej i efektywność odpowiedzi narzędzi są odrębną dziedziną projektowania. [Anthropic, Writing effective tools for agents — with agents, 11.09.2025](https://www.anthropic.com/research/writing-tools-for-agents).
- **Kontekst:** pobieranie szczegółów na żądanie, lekkie referencje, podejście hybrydowe i kompakcja. Analiza limitu przypinanych wiadomości dotyczy już lokalnego Harnessu. [Anthropic, Effective context engineering for AI agents, 29.09.2025](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents).
- **MCP i tożsamość:** integracja protokołu wymaga kontroli zakresu uprawnień oraz prawidłowego obchodzenia się z poświadczeniami. Propagowanie tożsamości nie oznacza bezwarunkowego przekazywania dowolnego tokenu dalej. [MCP, Security Best Practices](https://modelcontextprotocol.io/docs/draft/tutorials/security/security_best_practices).
- **Wznowienie:** zapisane zakończone czynności nie są ponownie wykonywane podczas replay; awaria przed zapisaniem wyniku może prowadzić do ponowienia. Idempotencję egzekwuje także system przyjmujący operację. [Temporal, Activity Definition — Idempotency](https://docs.temporal.io/activity-definition#idempotency). Umieszczanie operacji niedeterministycznych w activities opisuje [Temporal, Workflow Definition](https://docs.temporal.io/workflow-definition).
- **Praca przez wiele sesji:** lista wymaganych funkcji, przyrostowe wykonanie i artefakty przekazania stanu pochodzą z konkretnego doświadczenia autorów z agentem programistycznym. [Anthropic, Effective harnesses for long-running agents, 26.11.2025](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents).
- **Sędzia językowy:** wpływ pozycji, rozwlekłości i preferowania własnych odpowiedzi to ograniczenia opisane w badaniu; nie twierdzenie, że każdy sędzia zawsze zachowuje się tak samo. [Zheng i in., Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena, 2023](https://arxiv.org/abs/2306.05685).
- **Ewaluacja:** oddzielna ocena rezultatu i śladu, dobór graderów oraz różnica między sukcesem co najmniej raz a sukcesem we wszystkich próbach. Scenariusze raportów i projekt porównania są własną propozycją, rozwijającą też materiał czwartego wykładu. [Anthropic, Demystifying evals for AI agents, 09.01.2026](https://www.anthropic.com/research/demystifying-evals-for-ai-agents).

## Przygotowanie nagrania w ElevenLabs

Zaimportuj **podcast.txt** do Studio. ElevenLabs dokumentuje import TXT, pracę na akapitach oraz słowniki wymowy. Przed pełną generacją sprawdź krótki fragment z nazwami technicznymi. [Dokumentacja ElevenCreative Studio](https://elevenlabs.io/docs/eleven-creative/products/studio).

Proponowana interpretacja: spokojny polski dokument popularnonaukowy, rzeczowy i zaciekawiony narrator, wyraźne końcówki zdań, niewielkie zróżnicowanie emocjonalne, krótkie pauzy po pytaniach oraz dłuższe przy zmianie zagadnienia. Bez reklamowego tempa i przesadnej teatralności. To wskazówki do doboru głosu i odsłuchu; nie należy dopisywać ich do czytanego tekstu.

Tempo docelowe to średnio około **130 słów na minutę wraz z pauzami**. Najpierw wygeneruj próbkę i zmierz tempo. Po pełnym renderze sprawdź długość; jeśli potrzebujesz dokładnie 30:00, dostosuj szybkość lub długość pauz do rzeczywistego nagrania. Orientacyjny mnożnik szybkości to czas uzyskanego nagrania podzielony przez 1800 sekund. Ponowna generacja może nie odwzorować czasu idealnie.

Sprawdź wymowę: **harness**, **LangChain**, **SWE-agent**, **MCP**, **Temporal**, **Keycloak**, **Apache Iggy**, **sandbox**, **worker**, **adapter**. Przy MCP naturalne jest „em ce pe”. Pozostałych nazw nie zastępowano fonetycznie w pliku, aby można było ustawić wymowę pod wybrany głos. Liczby w narracji są zapisane słownie.

### Propozycja lektora

Odsłuch zacząłbym od **Tomasz Z – Expressive and Deep**. Alternatywnie sprawdziłbym **Piotr – Engaging, Reassuring Storyteller**. Oba głosy są wymienione na oficjalnej stronie polskiego TTS ElevenLabs. Wybór do tego scenariusza jest propozycją na podstawie opisu, nie oceną odsłuchanej przeze mnie próbki. [Polskie głosy ElevenLabs](https://elevenlabs.io/text-to-speech/polish).

Piotr z tej listy nie jest tu utożsamiany z Piotrem Fronczewskim. ElevenLabs potwierdza głos Fronczewskiego w **ElevenReader**, ale samo to nie potwierdza dostępności do generowania i eksportowania własnego podcastu w Studio. [Ogłoszenie ElevenReader po polsku](https://elevenlabs.io/pl/blog/elevenreader-pl).
