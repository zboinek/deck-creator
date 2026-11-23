#!/bin/bash
# Renderuje infografiki HTML -> attachments/NN-nazwa.png (1600x900 @2x). Użycie: ./render.sh [--en] [nazwa ...]
# --en: źródła <nazwa>-en.html -> attachments/en/NN-nazwa.png (wersja dla deck-en.md)
set -e
cd "$(dirname "$0")"
SUF=""; OUT="attachments"
if [ "$1" = "--en" ]; then SUF="-en"; OUT="attachments/en"; shift; mkdir -p "$OUT"; fi
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot() { "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=1600,900 \
  --virtual-time-budget=4000 --screenshot="$PWD/$OUT/$1.png" "file://$PWD/$2" 2>/dev/null; echo "$OUT/$1.png"; }
declare -a MAP=(02:jedno-pytanie 03:bezstanowosc 04:okno-kontekstu 05:trzy-persony 06:goldilocks 07:zrodla-profilu 08:skladanie 09:przed-po 10:przytakiwanie 11:narzedzie-cykl 12:agent-przebieg)
for e in "${MAP[@]}"; do
  n=${e%%:*}; name=${e#*:}
  if [ $# -gt 0 ] && [[ ! " $* " =~ " $name " ]]; then continue; fi
  shot "$n-$name" "$name$SUF.html"
done
# postep.html: ta sama mapa w 8 stanach (0 = mapa wykładu, 1-7 = bieżący krok; stan 8 = wszystko omówione, nieużywany)
if [ $# -eq 0 ] || [[ " $* " =~ " postep " ]]; then
  shot "01-mapa-wykladu" "postep$SUF.html?krok=0"
  for k in 1 2 3 4 5 6 7; do shot "16-postep-krok$k" "postep$SUF.html?krok=$k"; done
fi
