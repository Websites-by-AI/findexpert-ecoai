---
license: apache-2.0
language:
  - fa
  - en
pretty_name: FindExpert.ir ecoAI knowledge
task_categories:
  - text-retrieval
  - question-answering
tags:
  - grants
  - rfp
  - patents
  - wildfire
  - iran
  - RAG
  - university-industry
configs:
  - config_name: default
    data_files:
      - split: train
        path: data/train.jsonl
---

# FindExpert.ir ecoAI knowledge

Short **original** rows for retrieval (grants, RFPs, patents, academic stubs, green business, bot/site tools).

- Embedder to pin: [`intfloat/multilingual-e5-small`](https://huggingface.co/intfloat/multilingual-e5-small) (prefix `query:` / `passage:`). Do **not** fork MiniLM.
- Space: [`sosa123454321/ecoai-space`](https://huggingface.co/spaces/sosa123454321/ecoai-space)
- Generation stays on [FindExpert.ir](https://findexpert.ir) + Telegram [`@FindExperts_bot`](https://t.me/FindExperts_bot) (Gemini). This dataset is retrieval, not a 14B writer.

## Schema

```json
{
  "id": "grant-gef-sgp-1",
  "split_role": "kb",
  "doc_type": "grant",
  "lang": "fa",
  "title": "...",
  "text": "...",
  "url": "https://...",
  "tags": ["climate", "iran"]
}
```

`embedded` adds `embeddings` (384-d float list) if the file is present.

## Related (link only — do not copy)

- Datasets: [CanadaFireSat](https://huggingface.co/datasets/EPFL-ECEO/CanadaFireSat), [eo4wildfires](https://huggingface.co/datasets/AUA-Informatics-Lab/eo4wildfires), [big_patent](https://huggingface.co/datasets/NortheasternUniversity/big_patent)
- Spaces: [Prithvi burn scars](https://huggingface.co/spaces/ibm-nasa-geospatial/Prithvi-100M-Burn-scars-demo), [NASA FIRMS](https://huggingface.co/spaces/Anjanette030/NASA_FIRMS), [grant-writing-assistant](https://huggingface.co/spaces/vanderbilt-dsi/grant-writing-assistant), [Explainable prior-art](https://huggingface.co/spaces/Renukswamy/Explainable-Patent-Prior-Art-Search)
