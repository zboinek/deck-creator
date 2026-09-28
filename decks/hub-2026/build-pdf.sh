#!/usr/bin/env bash
# Składa deck.md w Frontier-u-siebie.pdf (33 slajdy, 1600x900, fonty osadzone).
set -euo pipefail
cd "$(dirname "$0")"
python3 build-deck.py
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=20000 \
  --print-to-pdf="$PWD/Frontier-u-siebie.pdf" "file://$PWD/deck-print.html" 2>/dev/null
echo "Gotowe: $(pdfinfo Frontier-u-siebie.pdf | awk '/Pages/{print $2}') stron, $(du -h Frontier-u-siebie.pdf | cut -f1)"
