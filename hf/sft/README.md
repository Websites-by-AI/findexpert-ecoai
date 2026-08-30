---
license: apache-2.0
language:
  - fa
  - en
pretty_name: FindExpert ecoAI SFT
task_categories:
  - text-generation
  - question-answering
tags:
  - grants
  - academic
  - patents
  - instruction-tuning
  - iran
configs:
  - config_name: default
    data_files:
      - split: train
        path: data/train.jsonl
---

# FindExpert.ir ecoAI SFT (writer later)

Instruction rows (`messages`) for a **future** LoRA on `Qwen/Qwen2.5-0.5B-Instruct`.

v1 writing on the product is still **Gemini** (site + `@FindExperts_bot`). Do not train 8B/14B on a free Space.

Each example: system + user (section, title, **retrieved sources**) + assistant draft. That is retrieve-then-generate, not RAG-inside-the-weights.

Related: dataset [`ecoai-knowledge`](https://huggingface.co/datasets/sosa123454321/ecoai-knowledge), retriever [`ecoai-rag-encoder`](https://huggingface.co/sosa123454321/ecoai-rag-encoder).
