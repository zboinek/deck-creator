#!/usr/bin/env bash
# Fabryka Tokenów: *.html -> png/*.png (3200x1800), pętla na monitor stoiska.
set -euo pipefail
cd "$(dirname "$0")"

if grep -l '—\|&mdash;' ./*.html dtf.css; then
  echo "Em dash w treści, popraw przed renderem." >&2
  exit 1
fi

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p png
for f in 0*.html; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 --window-size=1600,900 \
    --virtual-time-budget=4000 \
    --screenshot="$PWD/png/${f%.html}.png" "file://$PWD/$f" 2>/dev/null
  echo "png/${f%.html}.png"
done
