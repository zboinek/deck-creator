# /// script
# requires-python = ">=3.10"
# dependencies = ["mcp>=2"]
# ///
"""Minimalny serwer MCP do wykładu 2: dwa narzędzia nad katalogiem notatek.

Podgląd w MCP Inspectorze:
    npx @modelcontextprotocol/inspector uv run serwer_notatki.py

Podłączenie do Claude Code:
    claude mcp add notatki -- uv run /pełna/ścieżka/serwer_notatki.py

Notatka `spotkanie.md` jest celowo zatruta (demo prompt injection),
a `przeczytaj_notatke` celowo nie pilnuje ścieżki (pytanie do sali: co z `../`?).
"""

from pathlib import Path

from mcp.server.mcpserver import MCPServer

mcp = MCPServer("notatki")
KATALOG = Path(__file__).parent / "notatki"


@mcp.tool()
def lista_notatek() -> list[str]:
    """Zwraca nazwy wszystkich notatek."""
    return sorted(p.stem for p in KATALOG.glob("*.md"))


@mcp.tool()
def przeczytaj_notatke(nazwa: str) -> str:
    """Zwraca treść notatki o podanej nazwie."""
    return (KATALOG / f"{nazwa}.md").read_text()


if __name__ == "__main__":
    mcp.run()  # transport stdio: serwer to lokalny proces hosta
