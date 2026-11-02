---
title: "Wstęp do uczenia maszynowego w kontekście przetwarzania zbiorów tekstów cz. 1"
date: 2025-11-17
author: "Jakub Zboina, Rafał Masłyk"
description: "Wykład 8: prompt, historia rozmowy, RAG i finetuning, rankingi LLM-ów, rodzaje modeli, kwantyzacja i mechanizm atencji"
category: AI1
---

# Wstęp do uczenia maszynowego w kontekście przetwarzania zbiorów tekstów cz. 1

## Sztuczna Inteligencja i Data Science 1 - Wykład

### Wstęp do uczenia maszynowego w kontekście przetwarzania zbiorów tekstów cz. 1

mgr inż. Jakub Zboina

mgr inż. Rafał Masłyk

---

## O prowadzącym

### mgr inż. Jakub Zboina

- Team leader zespołu AI w Comtegra S.A.
- Product manager: Comtegra GPU Cloud
- Wykładowca PJATK na kierunku kognitywistyka

![Ilustracja: wędrowiec na zielonych wzgórzach](attachments/02-o-prowadzacym.jpg)

---

## End-to-end AI

Wytwarzamy produkt od "ziemi" aż do warstwy 7.

![Model OSI, źródło: Wikipedia](attachments/03-model-osi.png)

---

## On-premise AI

### On-premise AI: co to?

- Wszystko jest utrzymywane w infrastrukturze klienta
- Może działać bez Internetu

![Płyta z akceleratorami GPU | 60%](attachments/04-plyta-gpu.jpg)

---

## Słowniczek pojęć

### Słowniczek pojęć

- Prompt: system, user, assistant
- Historia konwersacji
- RAG
- Chunk (of text)
- Finetuning

![Struktura promptu i historia rozmowy](attachments/05-struktura-promptu.png)

---

## Chat history

![Historia rozmowy: pierwsza wiadomość z dokumentem w kontekście](attachments/06-chat-history-1.png)

---

## Chat history

![Historia rozmowy: kolejna instrukcja korzysta z wcześniejszego kontekstu](attachments/07-chat-history-2.png)

---

## Chat history

![Historia rozmowy: trzecia tura, kontekst wciąż w historii](attachments/08-chat-history-3.png)

---

## Context może być dynamiczny

![Odpowiedź modelu z wyszukiwaniem w internecie jako dynamicznym kontekstem](attachments/09-kontekst-dynamiczny.png)

---

## RAG

### Retrieval augmented generation

- Używa wiedzy spoza modelu
- LLM-y świetnie wyciągają informacje z podanego tekstu
- Trzeba wiedzieć, jakie dokumenty podać do LLM-a

![Dokumenty PDF, DOCX i WWW trafiają do user context](attachments/10-rag.png)

> _Notatka prowadzącego:_ To ten sam blok User context co na slajdach z historią rozmowy. RAG zmienia tylko to, skąd się bierze: zamiast pliku wrzuconego ręcznie system sam dobiera fragmenty z dokumentów.

---

## Dokumenty i chunki

### Dokumenty i chunki

- Nie możesz załadować wszystkich dokumentów naraz
- Bazę wiedzy należy podzielić na mniejsze części
- Pojedyncza część jest nazywana chunkiem

![Dokumenty dzielone na chunki](attachments/11-dokumenty-chunki.png)

---

## Finetuning

### Finetuning

- Potrzebuje sporo mocy obliczeniowej
- Model jest w stanie operować bez zewnętrznej bazy wiedzy
- Zdecydowanie mniej dynamiczny niż RAG

![Pre-training na ogromnym zbiorze i finetuning na danych domenowych](attachments/12-finetuning.png)

---

## Czy modele rzeczywiście myślą?

### Czy modele rzeczywiście myślą?

- Nie, ale...
- Modele są w stanie łączyć fakty i agregować informacje
- Nauka języka odbywa się w sposób nienadzorowany
- Instrukcje i fakty są do modelu podawane wraz z opisem
- Modele zaczynają rozumieć prawa fizyki

![Pytanie o przedmiot na pchanym stole, odpowiedź Bielika](attachments/13-czy-mysla-bielik.jpg)

---

## Prawa fizyki

![Ten sam test: odpowiedź Bielika i Claude'a](attachments/14-bielik-vs-claude.png)

---

## LLM IQ

### 09.2024, [trackingai.org/IQ](https://trackingai.org/IQ)

![Wyniki testu IQ modeli, 09.2024](attachments/15-llm-iq-2024-09.png)

---

## LLM IQ

### 17.03.2025, [trackingai.org/IQ](https://trackingai.org/IQ)

![Wyniki testu IQ modeli, 17.03.2025](attachments/16-llm-iq-2025-03.png)

---

## LLM IQ

### 17.11.2025, [trackingai.org/IQ](https://trackingai.org/IQ)

![Wyniki testu IQ modeli, 17.11.2025](attachments/17-llm-iq-2025-11.png)

---

## LLM IQ

### 11.2026, [trackingai.org/IQ](https://trackingai.org/IQ)

![Wyniki testu IQ modeli, 11.2026](attachments/17-llm-iq-2026-11.png)

---

## IQ Test

![Przykładowe zadanie z testu IQ i odpowiedzi modeli](attachments/18-iq-test.png)

---

## Self learning AI

![Google DeepMind: AI achieves silver-medal standard solving International Mathematical Olympiad problems](attachments/19-alphaproof.png)

---

## Self learning AI

### Złoty medal na IMO 2025, [deepmind.google](https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/)

![Google DeepMind: Gemini Deep Think achieves gold-medal standard at the International Mathematical Olympiad](attachments/gold-medal.png)

---

## Self learning AI

![Złoty medal na IMO: rozwiązania w języku naturalnym|50%](attachments/gold-medal-informal.png)

---

## Agent based workflows

### ~~Prompt based programming~~ Agent based workflows

- Oprócz kodu programy zawierają też prompty
- Różne prompty dla różnych zadań: granularność = jakość
- ~~Różne prompty dla różnych modeli: jak został wytrenowany model~~
- Generuj vs wykonuj instrukcje
- Determinizm
- ~~Wykonywanie funkcji~~
- Narzędzia i MCP: model sam decyduje, co wywołać
- Pętla agenta: planuj, działaj, sprawdź wynik

![Robot przy klawiaturze](attachments/20-robot.jpg)

---

## Czy zadziała tak jak chcieliśmy?

### Czy zadziała tak, jak chcieliśmy?

Nie chodzi o to, żeby się bać.

Po prostu trzeba mieć świadomość, a przede wszystkim zbudować **wyczucie**.

... no i sprawdzać i jeszcze raz sprawdzać.

![Skomplikowana maszyna|70%](attachments/21-maszyna.png)

---

## I mieć świadomość

![2+2= trzy razy do LLM-a: odpowiedzi 4, 4 i 5](attachments/22-llm-2plus2.png)

---

## Co może pójść nie tak

### Co może pójść nie tak

- Co ciekawego można robić w Wietnamie? Wyświetl w formie numerowanej listy
- Rozplanuj atrakcje 1, 4, 8, 14, 17, 18, 20 na przestrzeni 10 dni, z uwzględnieniem transportu, tak aby komunikacja była jak najkrótsza
  - Dostajemy znak, że część trasy najlepiej pokonać samochodem
- Czy mając europejskie prawo jazdy kategorii B, mogę swobodnie poruszać się samochodem osobowym po Wietnamie?

![Model A to Llama3-8B, model B to GPT-3.5](attachments/23-wietnam-a-b.png)

---

## 4 modele, 4 różne odpowiedzi

![Model A: Bielik-7B-Instruct-v0.1, model B: mixtral-8x7b-32768, bonus: Bielik-2.2-11B](attachments/24-wietnam-4-modele.png)

---

## Duże modele językowe

### Duże modele językowe

Nie zrażajcie się, nie musicie pamiętać szczegółów.

---

## Skąd możemy wziąć LLM-a

![Ollama, llama.cpp, vLLM, SGLang: od lokalnego uruchamiania do serwowania na GPU](attachments/26-skad-llm.png)

---

## Jak możemy podzielić modele

### 3rd party (API) vs self hosted

![Dostawcy modeli: OpenAI, Mistral AI, Gemini, Meta AI, Anthropic, Qwen, Gemma, Bielik, PLLuM, Kimi](attachments/27-dostawcy-modeli.png)

---

## Kto wygrywa walkę o serca użytkowników?

![Gemini wbudowany w pasek adresu Chrome](attachments/28-google-gemini.png)

---

## LLMs ranking: benchmarks

[Open PL LLM Leaderboard](https://huggingface.co/spaces/speakleash/open_pl_llm_leaderboard)

![Ranking polskich LLM-ów: 09.2024, 10.2024, 03.2025, 11.2025](attachments/29-pl-llm-leaderboard.png)

---

## Wszystkie modele

[artificialanalysis.ai](https://artificialanalysis.ai/)

![Artificial Analysis: wszystkie modele](attachments/30-artificial-analysis-wszystkie.png)

---

## Wszystkie modele: listopad 2026

[artificialanalysis.ai](https://artificialanalysis.ai/)

![Artificial Analysis: wszystkie modele, listopad 2026](attachments/30-artificial-analysis-wszystkie-2026.png)

---

## Modele OpenWeight

[artificialanalysis.ai](https://artificialanalysis.ai/)

![Artificial Analysis: modele open weight](attachments/31-artificial-analysis-openweight.png)

---

## Modele OpenWeight: listopad 2026

[artificialanalysis.ai](https://artificialanalysis.ai/)

![Artificial Analysis: modele open weight, listopad 2026](attachments/31-artificial-analysis-openweight-2026.png)

---

## LLMs ranking: arena

[chat.lmsys.org/?leaderboard](https://chat.lmsys.org/?leaderboard) (przeniesiony)

![LMSYS Arena: 06.2024, 09.2024, 10.2024 bez zmian](attachments/32-lmsys-arena-2024.png)

---

## LLMs ranking: arena

[chat.lmsys.org/?leaderboard](https://chat.lmsys.org/?leaderboard) (przeniesiony)

![LMSYS Arena: 10.2024 i 03.2025](attachments/33-lmsys-arena-2025.png)

---

## To nadal ta sama arena

[lmarena.ai/leaderboard/text](https://lmarena.ai/leaderboard/text)

![LMArena, ranking tekstowy](attachments/34-lmarena-2025-11.png)

---

## LMArena: listopad 2026

[lmarena.ai/leaderboard/text](https://lmarena.ai/leaderboard/text)

![LMArena, ranking tekstowy, listopad 2026](attachments/34-lmarena-2026-11.png)

---

## Spichlerz arena

[arena.speakleash.org.pl/leaderboard](https://arena.speakleash.org.pl/leaderboard)

![Chat Arena PL, 11.2025](attachments/35-spichlerz-arena.png)

---

## MT-Bench-PL

### MT-Bench-PL

- Obecne benchmarki przestają być wystarczające
- Nowe modele osiągają niemal 100%

![Wyniki MT-Bench-PL](attachments/36-mt-bench-pl.png)

---

## Jak możemy podzielić modele

### Jak możemy podzielić modele

- Foundational vs Instruct vs PPO
- 7B, 8B, 11B, 13B, 22B, 70B, 8x7B, 8x22B, 405B parametrów
- FP16 vs INT8 vs INT5 vs INT4
- Jednomodalne vs multimodalne

<!-- columns -->

**Foundational:** `User: Dawno, dawno temu...`

**Instruct:** `User: Jesteś pisarzem. Napisz mi baśń`

**Z szablonem instrukcji:**

```
[INST] Jesteś pisarzem. Napisz mi baśń.
Jeśli rozmowa będzie trwała dalej,
wykonuj polecenia zgodnie z kolejnymi
zaleceniami [/INST]
```

---

## Foundation vs instruct vs PPO

![Win rate względem SFT 175B: PPO-ptx, PPO, SFT, GPT (prompted), GPT](attachments/38-foundation-instruct-ppo.png)

[How OpenAI gets ChatGPT to follow human instruction](https://www.linkedin.com/pulse/how-openai-gets-chatgpt-follow-human-instruction-evan-dunbar/)

---

## Liczba parametrów

### ~AI to mnożenie macierzy~

![Mnożenie dwóch macierzy wag](attachments/39-mnozenie-macierzy.png)

---

## Liczba parametrów

### Macierze + aktywacje

![Same macierze zwijają się do jednej, z ReLU sieć nie da się zwinąć, trzy ReLU tworzą namiot](attachments/40-macierze-relu.png)

> _Notatka prowadzącego:_ Bez aktywacji W3·W2·W1 można przemnożyć wcześniej i tysiąc warstw daje jedną macierz. ReLU działa jak przełącznik, a to, które neurony przepuszczają sygnał, zależy od wejścia (A i B zapalają inne neurony), więc sieci nie da się zwinąć. Namiot: ReLU(x) − 2·ReLU(x−1) + ReLU(x−2) daje kształt, którego żadna macierz nie zrobi. Pojedyncza aktywacja jest banalna, złożona jest dopiero ich kompozycja z wyuczonymi wagami.

---

## Kwantyzacja

#### FP16 (half-precision floating-point)

- Total bits: 16
- Possible values: 2^16 = 65 536
- Część z nich to wartości specjalne (NaN, infinity)
- Efektywnie około 65 504 liczb skończonych

#### INT8 (8-bit integer)

- Total bits: 8, possible values: 2^8 = 256
- Zakres -128 do 127 (signed) lub 0 do 255 (unsigned)

<!-- columns -->

#### INT5 (5-bit integer)

- Total bits: 5, possible values: 2^5 = 32
- Zakres -16 do 15 (signed) lub 0 do 31 (unsigned)

#### INT4 (4-bit integer)

- Total bits: 4, possible values: 2^4 = 16
- Zakres -8 do 7 (signed) lub 0 do 15 (unsigned)

---

## Kwantyzacja

| Kwantyzacja | Wartości (binarnie) | Wartości (dziesiętnie) | Zakres (signed) | Zakres (unsigned) |
|---|---|---|---|---|
| FP16 | 2^16 | 65536 | liczby skończone | liczby skończone |
| INT8 | 2^8 | 256 | -128 do 127 | 0 do 255 |
| INT5 | 2^5 | 32 | -16 do 15 | 0 do 31 |
| INT4 | 2^4 | 16 | -8 do 7 | 0 do 15 |

<!-- columns -->

| INT5 | INT4 |
|---|---|
| 0 = 00000 | 0 = 0000 |
| 0.5 = 00001 | 1 = 0001 |
| 1 = 00010 | 2 = 0010 |
| 1.5 = 00011 | 3 = 0011 |
| ... | ... |
| 15 = 11110 | 15 = 1111 |

---

## Q, K, SML w kwantyzacji

### Q, K, SML w kwantyzacji

- **Q** to głębokość kwantyzacji: ile bitów użyto do zapisania pojedynczej wagi (Q2-Q8)
  - Niższe Q to większa agresja: szybsze działanie i mniej pamięci, ale też utrata wiedzy i więcej halucynacji
- **K**: użycie k-means clustering lub innych metod optymalizacyjnych
- **S, M, L**: small, medium, large. Im mniejszy, tym mniejsze latency, ale większy quality loss (nieoficjalnie)

![Formaty zmiennoprzecinkowe i pliki GGUF Bielika w różnych kwantyzacjach | 60%](attachments/42-bielik-gguf.png)

---

## Mechanizm uwagi/atencji

### Attention is all you need

![Wzór atencji: softmax z QKᵀ przez pierwiastek z d_k, razy V, obok architektura transformera](attachments/43-atencja-wzor.png)

---

## Mechanizm atencji

### Mucha

Nie widzieliście może mojej muchy? Ostatnio wisiała na wieszaku obok krawatów.

**Mechanizm atencji pozwala zrozumieć znaczenie w zależności od kontekstu.**

![Embedding słowa "mucha" przesuwa się od owadów w stronę garderoby](attachments/44-atencja-mucha.png)

---

## Jak LLM widzi tekst


![Każde słowo zdania "Nie widzieliście może mojej muchy?" to wektor liczb](attachments/46-atencja-1-wektory.png)

> _Notatka prowadzącego:_ Model nie widzi liter, tylko wektory. Wektor "muchy" na wejściu jest taki sam w każdym zdaniu, niezależnie od kontekstu. Zapowiedź: przez następne cztery slajdy śledzimy, jak atencja zmienia właśnie ten jeden wektor.

---

## Mechanizm atencji


![Muchy wysyła query, krawatów odpowiada kluczem i wartością, iloczyn q i k jest wysoki](attachments/47-atencja-2-qkv.png)

> _Notatka prowadzącego:_ Z każdego wektora trzy macierze robią trzy wersje. Query to pytanie, Key to etykieta, którą token się przedstawia, Value to treść, którą odda, jeśli ktoś na niego spojrzy. Analogia: wyszukiwarka, query to fraza, key to tytuł strony, value to jej zawartość. Macierze W są wyuczone, nikt nie programuje "krawat pasuje do muchy".

---

## Mechanizm atencji


![Wagi atencji tokenu muchy: krawatów 22%, wieszaku 20%, wisiała 16%](attachments/48-atencja-3-wagi.png)

> _Notatka prowadzącego:_ To jest dokładnie wzór z "Attention is all you need", policzony dla jednego wiersza. Liczby są poglądowe. Uczciwe zastrzeżenie: GPT i Bielik to dekodery, token widzi tylko to, co było przed nim, więc w praktyce to późniejsze tokeny ("wisiała", "krawatów") sięgają wstecz po "muchy". Mechanizm ten sam.

---

## Mechanizm atencji


![Wektor muchy przesuwa się od owadów do garderoby po dodaniu ważonych wartości](attachments/49-atencja-4-aktualizacja.png)

> _Notatka prowadzącego:_ Wracamy do wykresu z muchą sprzed kilku slajdów. Nowy wektor to stary plus ważona suma wartości. Największe wkłady dają tokeny, na które "muchy" patrzyła najmocniej. Ten sam token w zdaniu o owadach skończyłby gdzie indziej. To właśnie jest kodowanie tego, jak słowa na siebie wpływają.

---

## Mechanizm atencji


![Embedding, wczesne warstwy, środkowe warstwy, ostatnia warstwa przewiduje następny token](attachments/50-atencja-5-warstwy.png)

> _Notatka prowadzącego:_ Jedna warstwa atencji to za mało. Transformer powtarza blok atencja plus feed-forward dziesiątki razy (Nx z diagramu). Każda warstwa dodaje poprawkę, nie nadpisuje. Na końcu z ostatniego wektora liczymy rozkład prawdopodobieństwa następnego tokenu i tak powstaje każda odpowiedź LLM-a. Podział na wczesne i środkowe warstwy to uproszczenie, tak to wygląda w badaniach interpretowalności, ale bez ostrych granic.

---

## Podsumowanie

### Co dziś zobaczyliśmy

- **Prompt i kontekst**: model widzi tylko to, co dostanie w oknie, RAG dokłada wiedzę na żądanie
- **Finetuning**: wiedza wpisana w wagi, bez zewnętrznej bazy, ale mniej dynamiczny niż RAG
- **Rankingi**: benchmarki się nasycają, areny mierzą preferencje ludzi
- **Rodzaje modeli**: foundation, instruct, PPO, rozmiar i kwantyzacja
- **Atencja**: każdy token zmienia wektory pozostałych, warstwa po warstwie

---

## Dziękuję

### Pytania?

mgr inż. Jakub Zboina

mgr inż. Rafał Masłyk
