# /// script
# requires-python = ">=3.10"
# dependencies = ["openai>=1.0"]
# ///
"""Mini-harness do wykładu 1: cała pętla agentowa w jednym pliku.

Uruchomienie:
    uv run agent.py "Ile plików .md jest w tym katalogu i który jest największy?"
    # zależności (openai) uv czyta z metadanych u góry i instaluje sam;
    # token: wklej w API_KEY poniżej albo: export COMTEGRA_API_KEY=...

Każdy krok wypisuje, ile tokenów wejściowych poszło do modelu.
Na tym widać, że model jest bezstanowy: harness za każdym razem
wysyła mu całą dotychczasową historię.
"""

import json
import os
import subprocess
import sys

from openai import OpenAI

MODEL = "glm-53-nvfp4"
MAX_STEPS = 20  # L: twardy limit kroków, żeby agent nie kręcił się w kółko

# Token do llm.comtegra.cloud: wklej go w cudzysłów albo eksportuj COMTEGRA_API_KEY.
API_KEY = os.environ.get("COMTEGRA_API_KEY", "")
if not API_KEY:
    sys.exit("Brak tokena: wklej go w API_KEY albo ustaw COMTEGRA_API_KEY.")

client = OpenAI(
    base_url="https://llm.comtegra.cloud/v1",
    api_key=API_KEY,
)

# I_act: jedyne narzędzie, jakie dostaje model. Model nic nie wykonuje,
# tylko prosi harness o wykonanie komendy.
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "run",
            "description": "Uruchamia komendę powłoki w bieżącym katalogu i zwraca stdout oraz stderr.",
            "parameters": {
                "type": "object",
                "properties": {"command": {"type": "string", "description": "Komenda do uruchomienia"}},
                "required": ["command"],
            },
        },
    }
]

SYSTEM = "Jesteś agentem w terminalu. Sprawdzaj fakty komendami, zamiast zgadywać."


def run(command: str) -> str:
    # V: człowiek w pętli, nic nie wykona się bez zgody prowadzącego
    if input(f"\n  $ {command}\n  wykonać? [t/N] ").strip().lower() != "t":
        return "Użytkownik odmówił wykonania tej komendy."
    out = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
    # I_obs: harness decyduje, ile wyniku zobaczy model
    return (out.stdout + out.stderr)[-4000:] or "(brak wyjścia)"


def agent(task: str) -> None:
    messages = [  # S: cały stan agenta to ta lista
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": task},
    ]
    for step in range(1, MAX_STEPS + 1):
        response = client.chat.completions.create(
            model=MODEL, max_tokens=16000, tools=TOOLS, messages=messages
        )
        print(f"[krok {step}] tokeny wejściowe: {response.usage.prompt_tokens}")
        message = response.choices[0].message

        if response.choices[0].finish_reason != "tool_calls":  # model nie prosi o narzędzie: koniec
            messages.append({"role": "assistant", "content": message.content})
            print("\n" + (message.content or ""))
            return

        # odpowiedź z tool_calls wraca do historii, potem każde narzędzie odpowiada
        messages.append({
            "role": "assistant",
            "content": message.content,
            "tool_calls": [
                {"id": c.id, "type": "function",
                 "function": {"name": c.function.name, "arguments": c.function.arguments}}
                for c in message.tool_calls
            ],
        })
        for call in message.tool_calls:
            command = json.loads(call.function.arguments)["command"]
            messages.append({"role": "tool", "tool_call_id": call.id, "content": run(command)})

    print(f"\nPrzerwano po {MAX_STEPS} krokach.")


if __name__ == "__main__":
    agent(" ".join(sys.argv[1:]) or "Co jest w tym katalogu?")
