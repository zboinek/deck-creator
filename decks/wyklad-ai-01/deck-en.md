---
title: "Introduction to machine learning for processing text collections, part 1"
date: 2025-11-17
author: "Jakub Zboina, Rafał Masłyk"
description: "Lecture 8: prompts, conversation history, RAG and finetuning, LLM rankings, model types, quantization and the attention mechanism"
category: AI1
---

# Introduction to machine learning for processing text collections, part 1

## Artificial Intelligence and Data Science 1, Lecture

### Introduction to machine learning for processing text collections, part 1

Jakub Zboina, MSc Eng.

Rafał Masłyk, MSc Eng.

---

## About the lecturer

### Jakub Zboina, MSc Eng.

- Team leader of the AI team at Comtegra S.A.
- Product manager: Comtegra GPU Cloud
- Lecturer at PJATK, Cognitive Science programme

![Illustration: a hiker on green hills](attachments/02-o-prowadzacym.jpg)

---

## End-to-end AI

We build the product from the "ground" all the way up to layer 7.

![OSI model, source: Wikipedia](attachments/en/03-model-osi.png)

---

## On-premise AI

### On-premise AI: what is it?

- Everything runs on the customer's own infrastructure
- It can work without the Internet

![Board with GPU accelerators | 60%](attachments/04-plyta-gpu.jpg)

---

## Glossary

### Glossary

- Prompt: system, user, assistant
- Conversation history
- RAG
- Chunk (of text)
- Finetuning

![Prompt structure and conversation history](attachments/en/05-struktura-promptu.png)

---

## Chat history

![Conversation history: first message with a document in the context](attachments/en/06-chat-history-1.png)

---

## Chat history

![Conversation history: the next instruction uses the earlier context](attachments/en/07-chat-history-2.png)

---

## Chat history

![Conversation history: third turn, the context is still in the history](attachments/en/08-chat-history-3.png)

---

## Context can be dynamic

![Model answer with web search as dynamic context](attachments/en/09-kontekst-dynamiczny.png)

---

## RAG

### Retrieval augmented generation

- Uses knowledge from outside the model
- LLMs are great at extracting information from a given text
- You need to know which documents to give the LLM

![PDF, DOCX and WWW documents go into the user context](attachments/en/10-rag.png)

> _Notatka prowadzącego:_ This is the same User context block as on the conversation history slides. RAG only changes where it comes from: instead of a file uploaded by hand, the system picks fragments from the documents itself.

---

## Documents and chunks

### Documents and chunks

- You cannot load all documents at once
- The knowledge base has to be split into smaller parts
- A single part is called a chunk

![Documents split into chunks](attachments/11-dokumenty-chunki.png)

---

## Finetuning

### Finetuning

- Needs a lot of compute
- The model can work without an external knowledge base
- Much less dynamic than RAG

![Pre-training on a huge dataset and finetuning on domain data](attachments/12-finetuning.png)

---

## Do models really think?

### Do models really think?

- No, but...
- Models can connect facts and aggregate information
- Language is learned in an unsupervised way
- Instructions and facts are given to the model together with a description
- Models are starting to understand the laws of physics

![A question about an object on a pushed table, Bielik's answer](attachments/13-czy-mysla-bielik.jpg)

---

## Laws of physics

![The same test: Bielik's and Claude's answers](attachments/14-bielik-vs-claude.png)

---

## LLM IQ

### 09.2024, [trackingai.org/IQ](https://trackingai.org/IQ)

![IQ test results of models, 09.2024](attachments/15-llm-iq-2024-09.png)

---

## LLM IQ

### 17.03.2025, [trackingai.org/IQ](https://trackingai.org/IQ)

![IQ test results of models, 17.03.2025](attachments/16-llm-iq-2025-03.png)

---

## LLM IQ

### 17.11.2025, [trackingai.org/IQ](https://trackingai.org/IQ)

![IQ test results of models, 17.11.2025](attachments/17-llm-iq-2025-11.png)

---

## LLM IQ

### 11.2026, [trackingai.org/IQ](https://trackingai.org/IQ)

![IQ test results of models, 11.2026](attachments/17-llm-iq-2026-11.png)

---

## IQ Test

![A sample IQ test question and the models' answers](attachments/18-iq-test.png)

---

## Self learning AI

![Google DeepMind: AI achieves silver-medal standard solving International Mathematical Olympiad problems](attachments/19-alphaproof.png)

---

## Self learning AI

### Gold medal at IMO 2025, [deepmind.google](https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/)

![Google DeepMind: Gemini Deep Think achieves gold-medal standard at the International Mathematical Olympiad](attachments/gold-medal.png)

---

## Self learning AI

![Gold medal at IMO: solutions in natural language|50%](attachments/gold-medal-informal.png)

---

## Agent based workflows

### ~~Prompt based programming~~ Agent based workflows

- Besides code, programs also contain prompts
- Different prompts for different tasks: granularity = quality
- ~~Different prompts for different models: how the model was trained~~
- Generate vs execute instructions
- Determinism
- ~~Function calling~~
- Tools and MCP: the model decides what to call
- The agent loop: plan, act, check the result

![A robot at a keyboard](attachments/20-robot.jpg)

---

## Will it work the way we wanted?

### Will it work the way we wanted?

The point is not to be afraid.

You just need to be aware and, above all, build up a **feel** for it.

... and check, and check again.

![A complicated machine|70%](attachments/21-maszyna.png)

---

## And be aware

![2+2= sent three times to an LLM: answers 4, 4 and 5](attachments/22-llm-2plus2.png)

---

## What can go wrong

### What can go wrong

- What interesting things can you do in Vietnam? Show it as a numbered list
- Plan attractions 1, 4, 8, 14, 17, 18, 20 over 10 days, including transport, so that travel time is as short as possible
  - We get a hint that part of the route is best done by car
- With a European category B driving licence, can I freely drive a passenger car in Vietnam?

![Model A is Llama3-8B, model B is GPT-3.5](attachments/23-wietnam-a-b.png)

---

## 4 models, 4 different answers

![Model A: Bielik-7B-Instruct-v0.1, model B: mixtral-8x7b-32768, bonus: Bielik-2.2-11B](attachments/24-wietnam-4-modele.png)

---

## Large language models

### Large language models

Don't be put off, you don't need to remember the details.

---

## Where can we get an LLM

![Ollama, llama.cpp, vLLM, SGLang: from running locally to serving on GPUs](attachments/en/26-skad-llm.png)

---

## How can we classify models

### 3rd party (API) vs self hosted

![Model providers: OpenAI, Mistral AI, Gemini, Meta AI, Anthropic, Qwen, Gemma, Bielik, PLLuM, Kimi](attachments/27-dostawcy-modeli.png)

---

## Who is winning users' hearts?

![Gemini built into the Chrome address bar](attachments/28-google-gemini.png)

---

## LLMs ranking: benchmarks

[Open PL LLM Leaderboard](https://huggingface.co/spaces/speakleash/open_pl_llm_leaderboard)

![Ranking of Polish LLMs: 09.2024, 10.2024, 03.2025, 11.2025](attachments/29-pl-llm-leaderboard.png)

---

## All models

[artificialanalysis.ai](https://artificialanalysis.ai/)

![Artificial Analysis: all models](attachments/30-artificial-analysis-wszystkie.png)

---

## All models: November 2026

[artificialanalysis.ai](https://artificialanalysis.ai/)

![Artificial Analysis: all models, November 2026](attachments/30-artificial-analysis-wszystkie-2026.png)

---

## Open weight models

[artificialanalysis.ai](https://artificialanalysis.ai/)

![Artificial Analysis: open weight models](attachments/31-artificial-analysis-openweight.png)

---

## Open weight models: November 2026

[artificialanalysis.ai](https://artificialanalysis.ai/)

![Artificial Analysis: open weight models, November 2026](attachments/31-artificial-analysis-openweight-2026.png)

---

## LLMs ranking: arena

[chat.lmsys.org/?leaderboard](https://chat.lmsys.org/?leaderboard) (moved)

![LMSYS Arena: 06.2024, 09.2024, 10.2024 unchanged](attachments/32-lmsys-arena-2024.png)

---

## LLMs ranking: arena

[chat.lmsys.org/?leaderboard](https://chat.lmsys.org/?leaderboard) (moved)

![LMSYS Arena: 10.2024 and 03.2025](attachments/33-lmsys-arena-2025.png)

---

## Still the same arena

[lmarena.ai/leaderboard/text](https://lmarena.ai/leaderboard/text)

![LMArena, text leaderboard](attachments/34-lmarena-2025-11.png)

---

## LMArena: November 2026

[lmarena.ai/leaderboard/text](https://lmarena.ai/leaderboard/text)

![LMArena, text leaderboard, November 2026](attachments/34-lmarena-2026-11.png)

---

## Spichlerz arena

[arena.speakleash.org.pl/leaderboard](https://arena.speakleash.org.pl/leaderboard)

![Chat Arena PL, 11.2025](attachments/35-spichlerz-arena.png)

---

## MT-Bench-PL

### MT-Bench-PL

- Current benchmarks are no longer enough
- New models score close to 100%

![MT-Bench-PL results](attachments/36-mt-bench-pl.png)

---

## How can we classify models

### How can we classify models

- Foundational vs Instruct vs PPO
- 7B, 8B, 11B, 13B, 22B, 70B, 8x7B, 8x22B, 405B parameters
- FP16 vs INT8 vs INT5 vs INT4
- Unimodal vs multimodal

<!-- columns -->

**Foundational:** `User: Once upon a time...`

**Instruct:** `User: You are a writer. Write me a fairy tale`

**With an instruction template:**

```
[INST] You are a writer. Write me a fairy tale.
If the conversation continues,
follow the instructions according
to the next guidelines [/INST]
```

---

## Foundation vs instruct vs PPO

![Win rate against SFT 175B: PPO-ptx, PPO, SFT, GPT (prompted), GPT](attachments/38-foundation-instruct-ppo.png)

[How OpenAI gets ChatGPT to follow human instruction](https://www.linkedin.com/pulse/how-openai-gets-chatgpt-follow-human-instruction-evan-dunbar/)

---

## Number of parameters

### ~AI is matrix multiplication~

![Multiplying two weight matrices](attachments/39-mnozenie-macierzy.png)

---

## Number of parameters

### Matrices + activations

![Matrices alone collapse into one, with ReLU the network cannot be collapsed, three ReLUs make a tent](attachments/en/40-macierze-relu.png)

> _Notatka prowadzącego:_ Without activations W3·W2·W1 can be multiplied in advance and a thousand layers give a single matrix. ReLU acts as a switch, and which neurons let the signal through depends on the input (A and B light up different neurons), so the network cannot be collapsed. The tent: ReLU(x) − 2·ReLU(x−1) + ReLU(x−2) gives a shape no matrix can produce. A single activation is trivial, what is complex is their composition with learned weights.

---

## Quantization

#### FP16 (half-precision floating-point)

- Total bits: 16
- Possible values: 2^16 = 65 536
- Some of them are special values (NaN, infinity)
- Effectively about 65 504 finite numbers

#### INT8 (8-bit integer)

- Total bits: 8, possible values: 2^8 = 256
- Range -128 to 127 (signed) or 0 to 255 (unsigned)

<!-- columns -->

#### INT5 (5-bit integer)

- Total bits: 5, possible values: 2^5 = 32
- Range -16 to 15 (signed) or 0 to 31 (unsigned)

#### INT4 (4-bit integer)

- Total bits: 4, possible values: 2^4 = 16
- Range -8 to 7 (signed) or 0 to 15 (unsigned)

---

## Quantization

| Quantization | Values (binary) | Values (decimal) | Range (signed) | Range (unsigned) |
|---|---|---|---|---|
| FP16 | 2^16 | 65536 | finite numbers | finite numbers |
| INT8 | 2^8 | 256 | -128 to 127 | 0 to 255 |
| INT5 | 2^5 | 32 | -16 to 15 | 0 to 31 |
| INT4 | 2^4 | 16 | -8 to 7 | 0 to 15 |

<!-- columns -->

| INT5 | INT4 |
|---|---|
| 0 = 00000 | 0 = 0000 |
| 0.5 = 00001 | 1 = 0001 |
| 1 = 00010 | 2 = 0010 |
| 1.5 = 00011 | 3 = 0011 |
| ... | ... |
| 15 = 11110 | 15 = 1111 |

---

## Q, K, SML in quantization

### Q, K, SML in quantization

- **Q** is the quantization depth: how many bits are used to store a single weight (Q2-Q8)
  - Lower Q means more aggressive: faster and less memory, but also lost knowledge and more hallucinations
- **K**: use of k-means clustering or other optimisation methods
- **S, M, L**: small, medium, large. The smaller, the lower the latency, but the higher the quality loss (unofficially)

![Floating-point formats and Bielik GGUF files in different quantizations | 60%](attachments/42-bielik-gguf.png)

---

## The attention mechanism

### Attention is all you need

![Attention formula: softmax of QKᵀ over the square root of d_k, times V, next to the transformer architecture](attachments/en/43-atencja-wzor.png)

---

## The attention mechanism

![The vector of "bat" moves towards animals in "A bat is a mammal" and towards sports in "Have you seen my bat? I left it with my baseball glove and helmet."](attachments/en/44-atencja-bat.png)

> _Notatka prowadzącego:_ Start with sentence A, then read B. The word and its starting vector are identical, only the context differs. The next slides follow the "bat" token from sentence B step by step.

---

## How an LLM sees text


![Every word of the sentence "Have you seen my bat?" is a vector of numbers](attachments/en/46-atencja-1-wektory.png)

> _Notatka prowadzącego:_ The model does not see letters, only vectors. The input vector of "bat" is the same in every sentence, regardless of context. Preview: over the next four slides we follow how attention changes this one vector.

---

## The attention mechanism


![Bat sends a query, baseball answers with a key and a value, the dot product of q and k is high](attachments/en/47-atencja-2-qkv.png)

> _Notatka prowadzącego:_ Three matrices make three versions of every vector. Query is the question, Key is the label a token introduces itself with, Value is the content it hands over if someone looks at it. Analogy: a search engine, the query is the search phrase, the key is the page title, the value is its content. The W matrices are learned, nobody programs "a bat goes with baseball".

---

## The attention mechanism


![Attention weights of the token bat: baseball 22%, glove 20%, helmet 16%](attachments/en/48-atencja-3-wagi.png)

> _Notatka prowadzącego:_ This is exactly the formula from "Attention is all you need", computed for a single row. The numbers are illustrative. Honest caveat: GPT and Bielik are decoders, a token only sees what came before it, so in practice it is the later tokens ("baseball", "glove") that reach back to "bat". Same mechanism.

---

## The attention mechanism


![The bat vector moves from animals to sports after adding the weighted values](attachments/en/49-atencja-4-aktualizacja.png)

> _Notatka prowadzącego:_ Back to the "bat" chart from a few slides ago. The new vector is the old one plus a weighted sum of values. The largest contributions come from the tokens "bat" attended to most. The same token in a sentence about animals would end up somewhere else. This is exactly how the influence of words on each other is encoded.

---

## The attention mechanism


![Embedding, early layers, middle layers, the last layer predicts the next token](attachments/en/50-atencja-5-warstwy.png)

> _Notatka prowadzącego:_ One attention layer is not enough. A transformer repeats the attention plus feed-forward block dozens of times (the Nx from the diagram). Every layer adds a correction, it does not overwrite. At the end the last vector gives a probability distribution over the next token, and that is how every LLM answer is produced. The split into early and middle layers is a simplification, it is what interpretability research shows, but without sharp boundaries.

---

## Summary

### What we saw today

- **Prompt and context**: the model sees only what it gets in the window, RAG adds knowledge on demand
- **Finetuning**: knowledge written into the weights, no external base, but less dynamic than RAG
- **Rankings**: benchmarks saturate, arenas measure human preferences
- **Model types**: foundation, instruct, PPO, size and quantization
- **Attention**: every token changes the vectors of the others, layer by layer

---

## Thank you

### Questions?

Jakub Zboina, MSc Eng.

Rafał Masłyk, MSc Eng.
