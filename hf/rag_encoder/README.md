---
license: apache-2.0
library_name: sklearn
tags:
  - tf-idf
  - rag
  - retrieval
  - grants
  - academic
  - iran
language:
  - fa
  - en
pipeline_tag: sentence-similarity
datasets:
  - sosa123454321/ecoai-knowledge
---

# ecoai-rag-encoder

**Fitted retriever for FindExpert.ir ecoAI** (not a 14B LoRA, not a MiniLM fork).

This environment has ~2GB RAM and no GPU, so Qwen/E5 cannot be trained here. v1 “fine-tune” = **TF-IDF cosine fitted on** [`sosa123454321/ecoai-knowledge`](https://huggingface.co/datasets/sosa123454321/ecoai-knowledge).

RAG Space that **uses these weights**: [`sosa123454321/ecoai-space`](https://huggingface.co/spaces/sosa123454321/ecoai-space)

| File | Role |
| --- | --- |
| `encoder.joblib` | sklearn `TfidfVectorizer` + doc matrix |
| `encoder.json` | vocab + idf + sparse docs for the static Space |

Query the same way the Space does: vectorize the user text with this vocabulary, cosine vs documents, then **write** with Gemini on [findexpert.ir](https://findexpert.ir) (or future Qwen2.5-0.5B LoRA from [`ecoai-sft`](https://huggingface.co/datasets/sosa123454321/ecoai-sft)).

Dense upgrade later: encode `passage:` / `query:` with `intfloat/multilingual-e5-small` — do not replace this repo with forked MiniLM weights.
