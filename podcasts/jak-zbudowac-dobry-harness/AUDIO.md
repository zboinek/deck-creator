# Audio

Wersja publikowana: `jak-zbudowac-dobry-harness.opus` (Ogg Opus, mono,
64 kb/s VBR). Odtwarzacz preferuje plik `<slug>.opus`, a jeśli go nie ma,
korzysta z `<slug>.mp3`. URL zawiera wersję pliku, żeby przeglądarka nie
odtwarzała poprzedniego nagrania z cache po zmianie masteringu.

Oryginalny MP3, części syntezy i próbki odsłuchowe pozostają lokalnie,
poza Gitem i obrazem Docker. MP3 jest źródłem do ponownego masteringu;
nie należy zastępować go dekodowaną wersją Opusa. Trzeba przechowywać
jego kopię osobno, jeśli potrzebne będzie odtworzenie procesu na innym komputerze.

Uruchomienie z oryginalnym MP3 w tym katalogu:

```sh
python3 podcasts/jak-zbudowac-dobry-harness/master-audio.py
```

Wymagania: Python 3 i ffmpeg z libopus. Skrypt nie wywołuje usługi TTS.
Przetwarza oryginalny MP3 bez zmiany jego zawartości:

- filtr górnoprzepustowy 65 Hz;
- delikatna kompresja 1,6:1 z miękkim kolanem, attack 10 ms, release 180 ms;
- dwupassowa normalizacja do −18 LUFS, pułap −2 dBTP, docelowy LRA 7 LU;
- kodowanie do Opusa z tytułem, autorem, albumem, datą i gatunkiem.

Skrypt mierzy również zdekodowany wynik i dopiero po sprawdzeniu głośności
oraz zapasu szczytowego zastępuje wersję publikowaną. Wyniki zapisuje
w `audio-mastering.json`. Ocenę brzmienia należy uzupełnić odsłuchem.
