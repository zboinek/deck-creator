#!/usr/bin/env bash
# Sklada deck.md w Frontier-u-siebie.pptx (33 slajdy, 16:9, Arial, notatki prowadzacego).
# Nie idzie przez PDF - patrz naglowek build-pptx.py.
#   ./build-pptx.sh              tylko .pptx
#   ./build-pptx.sh --preview    dodatkowo PNG kazdego slajdu do preview/
set -euo pipefail
cd "$(dirname "$0")"

VENV="../../.venv/bin/python"
if [ ! -x "$VENV" ]; then
  echo "Brak środowiska. Utwórz je raz, z katalogu repo:" >&2
  echo "  python3 -m venv .venv && .venv/bin/pip install python-pptx pillow" >&2
  exit 1
fi

"$VENV" build-pptx.py

if [ "${1:-}" = "--preview" ]; then
  "$VENV" preview-pptx.py Frontier-u-siebie.pptx preview
fi

echo "Gotowe: $(du -h Frontier-u-siebie.pptx | cut -f1)"
