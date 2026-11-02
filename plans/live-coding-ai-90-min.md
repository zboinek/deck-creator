# Od terminala do produktu z AI — scenariusz 90 minut

- [ ] Terminal - how to use
- [ ] Dodaj zmiane do deck-creator, zeby spushowac podcast
- [ ] Utworzyc nowy projekt i pokazać BRIEF.md i AGENTS.md - do agents wpiszemy tylko info o tym jak chcemy commitowac
- [ ] Utworzyc nowy projekt ze speckitem i wystartować to samo
- [ ] Review i dalszy rozwoj


Termin: 2 listopada 2026. Format: prowadzący koduje na swoim komputerze, studenci obserwują, proponują wymagania i oceniają rezultaty. Zakładamy zróżnicowany poziom techniczny. Instalacja narzędzi na komputerach studentów pozostaje zadaniem po zajęciach; wspólna instalacja wymagałaby osobnego czasu.

## Cel zajęć

Student ma zobaczyć powtarzalny sposób pracy: określam rezultat, wybieram prosty stos, zlecam małą zmianę AI, oglądam kod i działanie, sprawdzam wynik, zapisuję postęp. Powinien rozumieć, gdzie działa przeglądarka, serwer, baza i model, oraz umieć rozpocząć podobny projekt.

Proponowane otwarcie:

> Dzisiaj pokażę wam mój warsztat pracy. Zaczniemy od terminala i zbudujemy aplikację, która przechowuje dane i korzysta z AI. Będę na głos wyjaśniał decyzje, sprawdzał wyniki i pokazywał, jak reaguję na błędy.

## Produkt: CampusDesk

Prosty system zgłoszeń usterek na uczelni. Student zgłasza problem, osoba obsługująca widzi listę i zmienia status. Asystent przygotowuje propozycję odpowiedzi na podstawie treści zgłoszenia i krótkiej instrukcji obsługi. Człowiek ocenia propozycję.

Przykładowe zgłoszenia: projektor nie działa, brak internetu w sali, niedostępna drukarka. Temat jest zrozumiały bez tłumaczenia procesów biznesowych, a naturalnie prowadzi do rozmowy o danych, statusach, odpowiedzialności i uprawnieniach.

Zakres podstawowy:

- Lista zgłoszeń i formularz dodawania.
- Statusy: nowe, w trakcie, zamknięte. Filtr po statusie.
- Trwały zapis do PostgreSQL, schemat Prisma, migracja i powtarzalny seed.
- Przycisk „Zaproponuj odpowiedź” przy jednym zgłoszeniu.
- Widoczny stan oczekiwania i błąd usługi AI; zgłoszenia działają również bez modelu.

Warunki zaliczenia demo: nowe zgłoszenie pozostaje po restarcie aplikacji; zmiana statusu pozostaje po odświeżeniu; pusty tytuł jest odrzucany po stronie serwera; asystent dostaje właściwe zgłoszenie; awaria modelu nie uniemożliwia obsługi zgłoszeń.

Poza zakresem tej sesji: konta użytkowników, załączniki, powiadomienia, autonomiczne działania modelu, wyszukiwarka wektorowa, MCP i wielu agentów. Są to możliwe kolejne etapy produktu. Brak uwierzytelnienia oznacza, że wersja demonstracyjna jest przeznaczona do pokazu lokalnego z fikcyjnymi danymi.

## Przebieg

| Minuty | Działanie na ekranie | Co student ma zrozumieć |
|---|---|---|
| 0–5 | Przedstaw problem, użytkownika i warunki ukończenia | Produkt zaczyna się od potrzeby i sposobu sprawdzenia rezultatu |
| 5–15 | Katalog, pliki, proces, terminalowy asystent | Terminal wykonuje konkretne polecenia w konkretnym miejscu |
| 15–23 | Narysuj przepływ i wyjaśnij elementy stosu | Każdy element ma jedną zrozumiałą rolę |
| 23–33 | Zapisz brief, zleć mały plan, uruchom szkielet aplikacji | AI potrzebuje celu, kontekstu i ograniczonego zadania |
| 33–48 | Uruchom bazę, schemat, migrację i seed; obejrzyj rekordy | Dane istnieją niezależnie od interfejsu |
| 48–60 | Dodaj zgłoszenie, zmień status, sprawdź walidację i trwałość | Funkcja to cały przepływ od kliknięcia do zapisu |
| 60–74 | Podłącz Comtegra LLM i przycisk propozycji odpowiedzi | Backend kontroluje dane, wywołanie modelu i obsługę błędów |
| 74–82 | Pokaż jedną kontrolowaną awarię i drogę rozwoju produktu | Zawodowa praca obejmuje diagnostykę i świadome granice rozwiązania |
| 82–90 | Pytania, odtworzenie przepływu przez studentów, zadanie własne | Student umie wskazać następny samodzielny krok |

Ostatnie osiem minut zawiera bufor. Jeśli praca się opóźnia, przeznacz do czterech minut na domknięcie przepływu i zachowaj co najmniej cztery na pytania oraz zadanie.

## 0–5: potrzeba i rezultat

Zacznij od pytania do sali: „Co musi się stać, żeby osoba zgłaszająca usterkę uznała, że ta aplikacja działa?”. Zbierz dwie odpowiedzi i powiąż je z warunkami zaliczenia.

Nazwij rolę AI w dwóch miejscach: asystent programistyczny pomaga budować aplikację, a model podłączony przez API dostarcza później funkcję użytkownikom. To osobne integracje i osobna konfiguracja dostępu.

## 5–15: oswojenie terminala

Pokaż na własnym systemie `pwd`, `ls`, `mkdir campusdesk`, `cd campusdesk`, `node --version`, `npm --version`. Powiedz, że nazwy części poleceń różnią się między powłokami; nie rób przeglądu wszystkich systemów operacyjnych.

Przed każdym poleceniem nazwij spodziewany efekt. Wyjaśnij katalog roboczy, argument polecenia i różnicę między programem, który się kończy, a serwerem czekającym na żądania. Przy późniejszym uruchomieniu aplikacji pokaż `Ctrl+C` i ponowne `npm run dev`.

Uruchom jedno wcześniej zainstalowane i zalogowane narzędzie, np. `codex`, z katalogu projektu. Claude Code może być alternatywą dla studentów; na scenie wystarczy jeden interfejs. Codex pracuje na plikach i uruchamia narzędzia w projekcie, a sposób pierwszego logowania opisuje [oficjalna dokumentacja](https://learn.chatgpt.com/docs/codex/cli).

Pierwsze polecenie do asystenta:

> Sprawdź, w jakim katalogu pracujemy i jakie narzędzia są dostępne. Wyjaśnij krótko, co będziemy potrzebowali do aplikacji Next.js z PostgreSQL. Na tym etapie niczego nie instaluj ani nie zmieniaj.

Pokaż, że możesz poprosić o wyjaśnienie polecenia przed jego wykonaniem. Zasygnalizuj uprawnienia do plików i uruchamiania komend na rzeczywistym przykładzie z narzędzia.

## 15–23: mapa stosu

Narysuj tylko ten schemat:

```text
Przeglądarka → Next.js na serwerze → Prisma → PostgreSQL
                         │
                         └→ API modelu Comtegra
```

| Element | Jedno zdanie do powiedzenia |
|---|---|
| JavaScript / TypeScript | Piszę logikę w jednym ekosystemie, a typy pomagają wcześniej wykryć część błędów. |
| Node.js | Uruchamia kod JavaScript poza przeglądarką, między innymi na serwerze. |
| npm | Instaluje zależności i uruchamia skrypty zapisane w projekcie. |
| React / Next.js | Daje interfejs oraz warstwę serwerową w jednym projekcie. |
| Prisma | Opisuje model danych i zapewnia API dostępu do bazy; proces migracji pozwala wersjonować zmiany jej struktury. |
| PostgreSQL | Przechowuje dane niezależnie od działającego procesu aplikacji. |
| Git | Zapisuje punkty historii, pozwala oglądać różnice i wrócić do poprzedniej wersji. |

Przedstaw to jako dobry domyślny zestaw do tego typu aplikacji. Skup się na rolach, aby student mógł później rozpoznać ich odpowiedniki w innych technologiach.

Przy ORM doprecyzuj: zmiana serwera PostgreSQL zwykle zachowuje API bazy, ale nadal wymaga przygotowania środowiska, migracji schematu i przeniesienia danych. Zmiana silnika, np. SQLite na PostgreSQL, może wymagać zmian typów, zapytań i migracji. Dokumentacja [Prisma Migrate v7](https://docs.prisma.io/docs/orm/v7/prisma-migrate/understanding-prisma-migrate/limitations-and-known-issues) wyraźnie opisuje zależność plików migracji od silnika. Dlatego demo od początku korzysta z PostgreSQL. Stos sam w sobie nie gwarantuje skalowalności.

## 23–33: brief i pierwszy działający ekran

Zapisz w repozytorium krótki `BRIEF.md`: użytkownik, problem, funkcje podstawowe, warunki zaliczenia, zakres na później. Dla Codexa krótki `AGENTS.md` może zawierać trwałe zasady pracy, a brief pozostaje opisem produktu.

Przykładowe zasady:

```text
Pracuj małymi zmianami zgodnie z BRIEF.md.
Przed zmianą sprawdź istniejący kod i wersje zależności.
Waliduj wejście na serwerze. Klucze API pozostają na serwerze.
Po zmianie sprawdź konkretny przepływ i opisz wynik weryfikacji.
Nie dodawaj funkcji poza uzgodnionym zakresem.
```

Prompt:

> Przeczytaj BRIEF.md. Zaproponuj plan w maksymalnie pięciu krokach. Zrealizuj teraz tylko szkielet aplikacji Next.js z TypeScript i ekran CampusDesk z pustą listą zgłoszeń. Korzystaj z uzgodnionych wersji zależności. Uruchom aplikację i sprawdź, czy strona się otwiera. Opisz sposób sprawdzenia.

Otwórz `package.json`: zależności to biblioteki, a `scripts` to nazwane polecenia projektu. Pokaż lockfile jako zapis rozstrzygniętych wersji. Na scenie korzystaj z wersji sprawdzonych podczas próby; aktualizowanie zależności jest osobnym zadaniem.

Gdy agent pracuje, czytaj z salą plan i pliki. Mów, jaką decyzję właśnie oceniasz. Po ukończeniu otwórz przeglądarkę i pokaż `git diff`. Zapisz pierwszy działający etap w Git.

## 33–48: baza i dane

Przygotuj wcześniej prosty Compose z jednym PostgreSQL i nazwanym wolumenem. Na scenie pokaż `docker compose up -d db` oraz gotowość bazy. Obraz powinien być już pobrany. Docker wymaga tu jednego wyjaśnienia: uruchamiamy usługę bazy w odtwarzalnym środowisku. Bez wykładu o kontenerach.

Model `Ticket`: identyfikator, tytuł, opis, lokalizacja, status i data utworzenia. Priorytet pozostaw jako późniejsze rozszerzenie, jeśli czas na to pozwoli.

Prompt:

> Dodaj model Ticket w Prisma zgodny z briefem, migrację dla PostgreSQL i seed 12 fikcyjnych zgłoszeń o stałych identyfikatorach. Ponowne uruchomienie seedu ma zachować liczbę tych rekordów. Dodaj skrypty projektu db:migrate i db:seed zgodne z zainstalowaną wersją Prisma oraz pokaż ich definicje. Uruchom migrację i seed na lokalnej bazie demonstracyjnej, a następnie sprawdź liczbę rekordów.

Nazwy `db:migrate` i `db:seed` są proponowanymi skryptami w `package.json`, a nie wbudowanymi komendami npm. Agent ma dopiero zdefiniować ich implementację zgodnie z wersją narzędzia. Obejrzyj migrację przed uruchomieniem.

Pokaż rekordy w Prisma Studio lub wcześniej przygotowanym kliencie bazy. Uruchom seed drugi raz i sprawdź liczbę. Rozróżnij: model opisuje strukturę, migracja zmienia strukturę, seed dodaje dane przykładowe.

Pytanie do sali: „Co zniknie, jeżeli teraz zatrzymam serwer aplikacji?”. Sprawdź tę hipotezę w kolejnym etapie.

## 48–60: pierwszy pełny przepływ

Prompt:

> Podłącz listę do bazy. Dodaj formularz zgłoszenia, zmianę statusu i filtr statusu. Waliduj tytuł oraz dozwolony status na serwerze. Pokaż komunikat sukcesu i błąd zapisu. Sprawdź dodanie zgłoszenia i zachowanie po odświeżeniu. Nie dodawaj kolejnych funkcji.

Wybierz ze studentami jeden tytuł zgłoszenia i wprowadź go na żywo. Obejrzyj rekord w bazie, zmień status, odśwież stronę i zrestartuj proces aplikacji. Zademonstruj odrzucenie pustego tytułu. Jeżeli interfejs blokuje wysyłkę, pokaż dodatkowo sprawdzenie walidacji po stronie serwera.

Krótko przejdź przez kod jednej operacji: dane formularza → walidacja → Prisma → odpowiedź serwera → aktualizacja widoku. Zapisz działający etap w Git.

## 60–74: model jako funkcja produktu

Adres w istniejących materiałach CGC: `https://llm.comtegra.cloud/v1`, bez kropki między `com` i `tegra`. Źródła lokalne: `decks/agenci-01-anatomia-harnessu/demo/agent.py` oraz `/Users/Jakub.Zboina/dev/CGC/cgc-web/README.md`. Dokumentacja lokalnego llmproxy opisuje `/v1/chat/completions` dla backendów typu chat. Nie wykonano w ramach przygotowania tego planu uwierzytelnionego testu usługi. Przed zajęciami sprawdź dostępność konkretnego modelu i wywołanie na koncie demonstracyjnym.

Ustal jeden model tekstowy dostępny na tym koncie. Zachowaj adres, klucz i identyfikator modelu w konfiguracji serwera. Na projektorze pokazuj `.env.example` z pustym kluczem. W Next.js prefiks `NEXT_PUBLIC_` służy do udostępniania wartości przeglądarce; klucz modelu powinien pozostać po stronie serwera. [Dokumentacja Next.js](https://nextjs.org/docs/app/guides/environment-variables).

Prompt:

> Dodaj przy zgłoszeniu przycisk „Zaproponuj odpowiedź”. Backend pobiera zgłoszenie z bazy po identyfikatorze i wysyła jego treść oraz krótką instrukcję obsługi do skonfigurowanego modelu Comtegra. Skorzystaj ze sprawdzonego endpointu chat/completions. Całą integrację zamknij w jednym module serwerowym. Klucz i nazwa modelu pochodzą z konfiguracji. Odpowiedź jest propozycją do oceny przez człowieka. Dodaj stan oczekiwania, limit czasu wywołania i zrozumiały błąd. Awaria AI ma pozostawić listę, dodawanie i zmianę statusu działające.

Instrukcja obsługi przekazywana modelowi ma być krótka: potwierdź przyjęcie zgłoszenia, odwołaj się do opisanego problemu, poproś o brakujące informacje, nie obiecuj terminu naprawy, którego nie ustalono. Opis zgłoszenia traktuj jako dane, a nie instrukcję sterującą asystentem. W tym demo model nie otrzymuje narzędzi do zmiany danych ani wysyłki.

Test na oczach sali: zgłoszenie o projektorze powinno dostać odpowiedź dotyczącą projektora. Przy niepełnym opisie propozycja powinna prosić o doprecyzowanie. Odczytaj ją i oceń zgodność z faktami. Tekst modelu może być niepoprawny mimo poprawnego połączenia API.

Najważniejsza myśl: model widzi dane, które przekazał mu program. W tej funkcji wystarcza jawny przepływ danych i jedno wywołanie. Kolejne mechanizmy dodajemy wtedy, gdy zadanie tego wymaga.

## 74–82: awaria i rozwój

Poświęć około czterech minut na jeden błąd. Jeśli wcześniej pojawił się naturalny błąd, wykorzystaj go. W przeciwnym razie jawnie ustaw w lokalnej konfiguracji demonstracyjnej nieistniejący identyfikator modelu, bez wyświetlania klucza. Pokaż błąd w UI, zwięzły log serwera, rozpoznanie przyczyny, przywrócenie konfiguracji i ponowny test. Potwierdź, że zwykła obsługa zgłoszeń nadal działa.

Prompt diagnostyczny:

> Odtwórz błąd przy generowaniu propozycji. Sprawdź log i konfigurację bez wyświetlania sekretów. Wskaż przyczynę na podstawie dowodu, zaproponuj najmniejszą poprawkę i po jej zastosowaniu sprawdź pierwotny przypadek.

Pozostałe cztery minuty przeznacz na pytanie: „Co musimy zmienić, jeżeli jutro ta aplikacja obsłuży całą uczelnię?”. Odnieś odpowiedzi do istniejącego kodu:

| Potrzeba | Następny krok |
|---|---|
| Dostęp wielu osób | Logowanie i sprawdzanie uprawnień do zgłoszeń na serwerze |
| Więcej danych | Paginacja, pomiar zapytań, indeksy dobrane do filtrów |
| Więcej ruchu | Pomiar obciążenia, połączeń do bazy i limitów modelu; skalowanie według wyniku |
| Utrzymanie usługi | Migracje wdrożeniowe, kopie bazy i sprawdzanie odtwarzania, logi i monitoring |
| Koszt i opóźnienie AI | Limity wywołań i długości wejścia, pomiar czasu oraz zużycia; kolejka, gdy pojawią się długie zadania |

Przeniesienie do chmury omów na schemacie: aplikacja, zewnętrzny PostgreSQL, konfiguracja i model. Samo ustawienie nowego adresu bazy nie przenosi danych. Na żywo wdrażaj tylko jako dodatkowy pokaz, jeśli cała ścieżka jest wcześniej sprawdzona i pozostaje czas poza planem podstawowym.

## 82–90: utrwalenie

Poproś salę o odtworzenie drogi danych od formularza do bazy i od zgłoszenia do modelu. Wróć do warunków zaliczenia i wskaż dowody z demonstracji.

Zadanie na później: dodać priorytet zgłoszenia. Oczekiwany rezultat obejmuje zmianę modelu i migrację, pole formularza, walidację, widok, filtr oraz opis sposobu sprawdzenia. Student powinien pokazać działanie i wyjaśnić jedną decyzję, którą zweryfikował po propozycji AI.

Zdanie do zamknięcia:

> Z AI można szybko zbudować pierwszą wersję produktu. Waszą umiejętnością będzie określenie, co ma działać, zrozumienie połączeń między elementami i zebranie dowodów, że rezultat jest poprawny.

## Przygotowanie przed sesją

- Przećwicz cały przepływ na tym komputerze; zmierz czas najwolniejszego generowania i wywołania modelu.
- Przygotuj Node, npm, Docker, zalogowane narzędzie AI, zależności w sprawdzonych wersjach i pobrany obraz bazy.
- Przygotuj brief, krótki plik instrukcji, Compose, fikcyjny seed i konfigurację demonstracyjną. Wyjaśnij studentom, co przygotowano wcześniej.
- Zachowaj sprawdzone etapy w osobnych katalogach lub gałęziach: szkielet, baza, działający przepływ, integracja AI. Przełączenie etapu nie powinno niszczyć niezapisanej pracy.
- Przed sesją wykonaj rzeczywiste wywołanie Comtegra i sprawdź dostępny budżet. Dostęp do asystenta programistycznego i klucz funkcji AI w aplikacji sprawdzaj osobno.
- Przygotuj zrzut przykładowej odpowiedzi AI oznaczony jako nagrany wynik; przy awarii sieci pokaż go jawnie jako materiał zastępczy.
- Ustaw dużą czcionkę, czytelny zoom przeglądarki, wyłącz powiadomienia. Trzy widoki wystarczą: terminal, przeglądarka, wybrany plik kodu.
- Przygotuj README do udostępnienia studentom: wymagania, uruchomienie, konfiguracja bez sekretów i zadanie z priorytetem.

## Reguły tempa i wariant awaryjny

Najpóźniej około 33. minuty ma działać szkielet, 48. minuty baza, 60. minuty pełny przepływ, 74. minuty funkcja AI. To punkty decyzyjne, a nie obietnica tempa modelu.

Jeżeli generowanie lub konfiguracja blokuje pokaz dłużej niż około trzy minuty, przejdź do wcześniej sprawdzonego etapu i pokaż konkretny diff. Powiedz wprost, że korzystasz z wersji przygotowanej podczas próby. Zachowaj demonstrację działania i weryfikacji.

Przy braku sieci działają lokalna aplikacja i baza. Przejdź przez kod integracji oraz oznaczoną wcześniejszą odpowiedź. Przy awarii lokalnej bazy skorzystaj ze sprawdzonego środowiska zapasowego; nie zmieniaj w trakcie zajęć silnika bazy.

Gdy brakuje czasu, pomiń kosmetykę, dodatkowe filtry i rozbudowaną rozmowę o wdrożeniu. Zachowaj zapis danych, sprawdzenie trwałości, pokaz granicy serwer–model i choć jedną weryfikację błędu.

## Wątki zaczerpnięte z podcastu

Materiał: [Jak zbudować dobry harness](../podcasts/jak-zbudowac-dobry-harness/podcast.txt).

- Kontrakt rezultatu → krótki brief i warunki zaliczenia przed kodowaniem.
- Właściwy kontekst → repozytorium, wersje, krótki plik instrukcji i małe zadanie.
- Weryfikacja → przeglądarka, rekord w bazie, restart i log jako dowody.
- Adekwatna autonomia → jedno wywołanie modelu do konkretnej funkcji; propozycja pozostaje do oceny.
- Obserwowalność → komunikat błędu powiązany z rzeczywistym logiem.

Te zasady mają być widoczne w Twojej pracy przez całą sesję. Nie potrzebują osobnego wykładu o architekturze harnessu.
