#!/bin/bash
# Renderuje infografiki HTML -> attachments/NN-nazwa.png (1600x900 @2x). Użycie: ./render.sh [--en] [nazwa ...]
# --en: źródła <nazwa>-en.html -> attachments/en/NN-nazwa.png (wersja dla deck-en.md)
set -e
cd "$(dirname "$0")"
SUF=""; OUT="attachments"
if [ "$1" = "--en" ]; then SUF="-en"; OUT="attachments/en"; shift; mkdir -p "$OUT"; fi
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
declare -a MAP=(01:mapa-wykladu 02:temperatura 03:docx-pdf 04:wektor-3-sposoby 05:jeden-wektor 15:wektor-wypadkowy 06:podobienstwo 07:knn 11:architektura 12:chunking 13:prompt-rag)
for e in "${MAP[@]}"; do
  n=${e%%:*}; name=${e#*:}
  if [ $# -gt 0 ] && [[ ! " $* " =~ " $name " ]]; then continue; fi
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=1600,900 \
    --virtual-time-budget=4000 --screenshot="$PWD/$OUT/$n-$name.png" "file://$PWD/$name$SUF.html" 2>/dev/null
  echo "$OUT/$n-$name.png"
done
# postep.html: ta sama mapa w 8 stanach (krok 1-7 bieżący, 8 = wszystko omówione) -> 16-postep-krokN.png
if [ $# -eq 0 ] || [[ " $* " =~ " postep " ]]; then
  for k in 1 2 3 4 5 6 7 8; do
    "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=1600,900 \
      --virtual-time-budget=4000 --screenshot="$PWD/$OUT/16-postep-krok$k.png" "file://$PWD/postep$SUF.html?krok=$k" 2>/dev/null
    echo "$OUT/16-postep-krok$k.png"
  done
fi
