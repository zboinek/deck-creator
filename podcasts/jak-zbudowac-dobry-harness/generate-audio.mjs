import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const directory = new URL('./', import.meta.url);
const text = (await readFile(new URL('podcast.txt', directory), 'utf8')).trim();
const chunks = [];
for (const paragraph of text.split(/\n\s*\n/)) {
  if (paragraph.length > 4500) throw new Error('Paragraph exceeds chunk limit');
  if (chunks.length && chunks.at(-1).length + paragraph.length + 2 <= 4500) {
    chunks[chunks.length - 1] += '\n\n' + paragraph;
  } else chunks.push(paragraph);
}
const modelId = 'eleven_multilingual_v2';
const voiceId = 'QoeWeX13dj9z4t3E5oI9';
const digest = createHash('sha256').update(JSON.stringify({text, modelId, voiceId})).digest('hex').slice(0, 12);
const parts = new URL(`audio-parts/${digest}/`, directory);
await mkdir(parts, { recursive: true });
const client = new ElevenLabsClient();
console.log(`${chunks.length} parts, ${text.length} characters, ${modelId}, voice Kuba`);
for (let i = 0; i < chunks.length; i++) {
  const target = new URL(`${String(i + 1).padStart(3, '0')}.mp3`, parts);
  if (await stat(target).then(s => s.size > 0).catch(() => false)) {
    console.log(`Part ${i + 1}: already saved`);
    continue;
  }
  console.log(`Generating part ${i + 1}/${chunks.length} (${chunks[i].length} characters)`);
  const audio = await client.textToSpeech.convert(voiceId, {
    text: chunks[i], modelId, outputFormat: 'mp3_44100_128',
    voiceSettings: { stability: 0.65, similarityBoost: 0.75, useSpeakerBoost: true },
    previousText: i ? chunks[i - 1].slice(-1000) : undefined,
    nextText: chunks[i + 1]?.slice(0, 1000),
  }, { maxRetries: 0, timeoutInSeconds: 300 });
  const temporary = new URL(`${String(i + 1).padStart(3, '0')}.partial`, parts);
  await pipeline(Readable.fromWeb(audio), createWriteStream(temporary));
  const { rename } = await import('node:fs/promises');
  await rename(temporary, target);
  console.log(`Saved part ${i + 1}`);
}
await writeFile(new URL('concat.txt', parts), chunks.map((_, i) => `file '${String(i + 1).padStart(3, '0')}.mp3'`).join('\n'));
const { fileURLToPath } = await import('node:url');
execFileSync('ffmpeg', ['-v', 'error', '-n', '-f', 'concat', '-safe', '0', '-i', fileURLToPath(new URL('concat.txt', parts)), '-c', 'copy', fileURLToPath(new URL('podcast.mp3', directory))]);
console.log('Finished: podcast.mp3');
