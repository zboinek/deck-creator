"""Run locally with Python 3 and ffmpeg; keeps the source MP3 untouched."""
import json
import pathlib
import re
import subprocess

directory = pathlib.Path(__file__).resolve().parent
slug = directory.name
source = directory / f"{slug}.mp3"
output = directory / f"{slug}.opus"
temporary = directory / f"{slug}.partial.opus"
# Gentle rumble removal and soft-knee compression, followed by two-pass loudness
# normalization. The -2 dBTP ceiling leaves headroom for lossy encoding.
processing = "highpass=f=65,acompressor=threshold=0.025:ratio=1.6:attack=10:release=180:knee=2.828:makeup=1"
target = "loudnorm=I=-18:TP=-2:LRA=7"


def measure(file, filters):
    result = subprocess.run([
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(file),
        "-af", filters + ":print_format=json", "-f", "null", "-",
    ], check=True, capture_output=True, text=True)
    return json.loads(re.findall(r'\{[^{}]+\}', result.stderr)[-1])


print("Measuring processed source…", flush=True)
stats = measure(source, processing + "," + target)
normalization = target + (
    f":measured_I={stats['input_i']}:measured_TP={stats['input_tp']}"
    f":measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}"
    f":offset={stats['target_offset']}:linear=true"
)
print("Encoding Opus 64 kb/s VBR…", flush=True)
subprocess.run([
    "ffmpeg", "-v", "error", "-y", "-i", str(source),
    "-map", "0:a:0", "-map_metadata", "-1", "-af", processing + "," + normalization,
    "-ar", "48000", "-ac", "1", "-c:a", "libopus", "-b:a", "64k",
    "-vbr", "on", "-application", "audio",
    "-metadata", "title=Jak zbudować dobry harness",
    "-metadata", "artist=Jakub Zboina", "-metadata", "album=Agenci AI",
    "-metadata", "date=2026-11-01", "-metadata", "genre=Podcast",
    str(temporary),
], check=True)
print("Verifying decoded Opus loudness and peaks…", flush=True)
verified = measure(temporary, target)
if abs(float(verified["input_i"]) + 18) > 0.6 or float(verified["input_tp"]) > -1:
    raise RuntimeError(f"Output outside loudness/headroom limits: {verified}")
temporary.replace(output)
report = {"filters": processing, "target": target, "first_pass": stats,
          "decoded_opus": verified, "source_bytes": source.stat().st_size,
          "output_bytes": output.stat().st_size}
(directory / "audio-mastering.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2), flush=True)
