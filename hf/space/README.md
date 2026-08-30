---
title: FindExpert ecoAI
emoji: 🌿
colorFrom: green
colorTo: blue
sdk: static
pinned: false
license: apache-2.0
short_description: Search FindExpert grants, patents, papers
---

# FindExpert.ir ecoAI Space

RAG over the **fitted** encoder [sosa123454321/ecoai-rag-encoder](https://huggingface.co/sosa123454321/ecoai-rag-encoder) (TF-IDF on [ecoai-knowledge](https://huggingface.co/datasets/sosa123454321/ecoai-knowledge)).

- Keyword search in the browser (no GPU, no Gradio bill).
- Embedder for a later CPU Space: `intfloat/multilingual-e5-small` (`query:` / `passage:`).
- Writing stays on [findexpert.ir](https://findexpert.ir) and Telegram [@FindExperts_bot](https://t.me/FindExperts_bot).

Do not load Prithvi, Qwen-14B, or CanadaFireSat files here.
