# Critique first, then a Hub structure that can actually be coded

This replaces the earlier “4 repos named RAG / LoRA / DB / Space” sketch. That sketch mixed Hub **repo types**, over-promised free compute, and would produce bad code if we implemented it as written.

---

## 1. Critique of the previous plan

### 1.1 “RAG model” is the wrong Hub object

RAG is a **pipeline**: embed query → nearest chunks in a dataset → generate an answer.

On Hugging Face that is **not** one model repo. Official-ish pattern ([HF RAG blog](https://huggingface.co/blog/not-lain/rag-chatbot-using-llama3)):

1. A **Dataset** with an `embeddings` column  
2. `dataset.add_faiss_index("embeddings")`  
3. A **Space** that loads `SentenceTransformer` + `load_dataset(...)`  
4. A **generator** (Gemini on FindExpert, or a tiny LM) — separate

Forking MiniLM into `findexpert-ir/ecoai-rag` adds nothing: you would republish 80MB of weights you do not own, and `pipeline_tag` would be wrong.

**Code implication:** do **not** train or upload an embedding model. Pin a Hub id in `requirements` / config.

### 1.2 Three embedders in one Space will OOM or crawl

Previous list: MiniLM + multilingual MiniLM + PatentSBERTa (+ optional BGE).

Free **CPU Basic** is **2 vCPU / 16 GB RAM / 50 GB ephemeral disk**, not persistent. [3](https://huggingface.co/docs/hub/en/spaces-overview)  
`paraphrase-multilingual-MiniLM-L12-v2` alone is ~0.4 GB weights. [1](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2/discussions/17)  
PatentSBERTa is another BERT. Loading two BERTs on cold start + FAISS + Gradio is how Spaces time out.

**Code implication:** **one** embedder. FindExpert is FA-first → **not** English `all-MiniLM-L6-v2` as the only model.

Better single choice:

| Model | Dim | Why |
| --- | --- | --- |
| [intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small) | 384 | 100 languages, 12 layers, **must prefix `query:` / `passage:`** |
| [sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) | 384 | Simpler API, no prefix, slightly weaker retrieval |

PatentSBERTa = **optional second index later**, not v1.

### 1.3 Fine-tune as “part 2” before data is cargo-cult

- [Jaume-inLab Qwen-3-14B grant LoRAs](https://huggingface.co/Jaume-inLab/Qwen-3-14B_SFT_Grant-Writing_LoRA) cannot run on CPU Basic (7B+ dies; 14B is hopeless). [1](https://techjacksolutions.com/ai-tools/hugging-face/hugging-face-spaces/)  
- One LoRA for grant + patent + IEEE paper + business plan **without hundreds of examples per task** will mix styles.  
- FindExpert already has a working writer: **Gemini 2.5 Flash**. Duplicating it badly on HF confuses users.

**Code implication:** v1 Space = **retrieve + show sources**. Generation stays Gemini (site/bot) or a 170M patent toy ([kl3m-002-170m-patent](https://huggingface.co/alea-institute/kl3m-002-170m-patent)) behind a checkbox. LoRA is **phase 2** after `ecoai-knowledge` has real instruction rows.

### 1.4 “Database” must be a Dataset repo, not a dump of CanadaFireSat

- Hub Dataset = Git + Parquet + **dataset card YAML** + Dataset Viewer. [2](https://huggingface.co/docs/hub/en/datasets-manual-configuration)  
- [CanadaFireSat](https://huggingface.co/datasets/EPFL-ECEO/CanadaFireSat) / [eo4wildfires](https://huggingface.co/datasets/AUA-Informatics-Lab/eo4wildfires) are **tens of GB**. Copying them into our Space disk (50 GB, wiped on rebuild) is a bug.  
- [big_patent](https://huggingface.co/datasets/NortheasternUniversity/big_patent) is copyrighted patent text — **link**, do not republish.

**Code implication:** our dataset is **short rows we wrote** (grants, RFPs, tool prompts, wildfire *citations*). Related Hub datasets go in README `tags` / `dataset_info` as **related**, not files.

### 1.5 “Free Space” is no longer “create Gradio with $0 for everyone”

Official Hub docs (current):

> Static Spaces are free for everyone. Gradio and Docker Spaces run on compute and **require a paid plan to create** (PRO personal, Team/Enterprise org). Free personal accounts in good standing can still host **up to 2 Gradio Spaces on ZeroGPU**. [3](https://huggingface.co/docs/hub/en/spaces-overview)

Also: Spaces **sleep**; disk is **not persistent**; secrets go in **Settings**, never in git.

**Code implication:**

- Ship a **Static** fallback (HTML) that always works for $0, **or** Gradio on ZeroGPU with `@spaces.GPU` only if we add a GPU model (we should not in v1).  
- v1 Gradio should be **CPU-only** (embeddings), assuming the account can still create CPU Basic / those 2 ZeroGPU slots.  
- `GEMINI_API_KEY` = Space **Secret**, same as FindExpert `.env.local`.

### 1.6 Linking 20 Spaces is a directory, not a product

Prithvi burn-scar, Vanderbilt grant writer, PatentSolver, FIRMS UIs — useful as **Related** markdown. Iframe/embed of GPU Spaces inside ours is fragile (sleep, X-Frame, ToS). Green Hope already taught us not to embed huge HF iframes.

### 1.7 Hub convention we violated

| Rule | We almost did wrong |
| --- | --- |
| One checkpoint per **model** repo [2](https://huggingface.co/docs/hub/models-faq) | Bundle embedder + LoRA + FAISS in one “RAG model” |
| README YAML = discovery (license, `pipeline_tag`, `datasets`, `base_model`) [5](https://huggingface.co/docs/hub/model-cards) | Plain markdown list |
| Collections group **distinct repos** | Fake 4-in-1 |
| Precompute embeddings, push to Hub, don’t re-embed on every Space boot [1](https://huggingface.co/blog/not-lain/rag-chatbot-using-llama3) | Embed at runtime in `app.py` |

---

## 2. Corrected structure (still four Hub objects, different meaning)

Order of **work** (not vanity names):

```
A. Dataset     findexpert-ir/ecoai-knowledge     ← write this first
B. Index       same dataset, config "embedded"   ← precomputed vectors + FAISS
C. Space       findexpert-ir/ecoai-space         ← load A+B, search UI
D. Writer      findexpert-ir/ecoai-writer-lora   ← only after A has train split
+ Collection   FindExpert.ir ecoAI
```

The old labels map as:

| Old name | Actual Hub type | v1? |
| --- | --- | --- |
| “Database” | **Dataset** (Parquet + card) | Yes |
| “RAG model” | **Dataset config `embedded`** + frozen Hub embedder id | Yes |
| “Space” | **Gradio Space** (CPU) | Yes if account allows; else Static |
| “Fine-tune” | **Model** LoRA, `base_model:` in YAML | **No for v1 code** |

Do **not** upload MiniLM/E5 weights. Depend on them.

```
ecoai-knowledge (Dataset)
  configs:
    - default     # text rows
    - embedded    # + embeddings  [revision or config]
         ↑
         │ load_dataset(..., name="embedded")
         │ add_faiss_index / get_nearest_examples
         ↓
ecoai-space (Gradio)
  SentenceTransformer("intfloat/multilingual-e5-small")  # query only
  optional: requests to FindExpert /api/ask (Gemini)
         ↓
FindExpert.ir site + @FindExperts_bot   # real writer
```

---

## 3. Extra Hub facts the code must respect

### Hardware / product

| Fact | Source |
| --- | --- |
| CPU Basic: 2 vCPU, 16 GB, 50 GB ephemeral | [Spaces overview](https://huggingface.co/docs/hub/en/spaces-overview) |
| Gradio/Docker create may need PRO; Static always free; ≤2 Gradio ZeroGPU on free personal | same |
| ZeroGPU = Gradio only, `@spaces.GPU`, quota in seconds | [ZeroGPU docs](https://huggingface.co/docs/hub/spaces-zerogpu) |
| Secrets in Space Settings, not `.env` in git | same overview |
| Sleep / cold start | community guides |

### Dataset repo layout (code this)

```
ecoai-knowledge/
  README.md          # YAML configs: + dataset_info
  data/train.jsonl   # or parquet
```

YAML ([manual config](https://huggingface.co/docs/hub/en/datasets-manual-configuration)):

```yaml
---
license: apache-2.0
language: [fa, en]
task_categories: [text-retrieval, question-answering]
pretty_name: FindExpert ecoAI knowledge
tags: [grants, patents, wildfire, RAG, iran]
configs:
  - config_name: default
    data_files:
      - split: train
        path: data/train.jsonl
---
```

Row schema (stable for RAG **and** later SFT):

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

Later `embedded` config adds `embeddings: sequence<float32>` (384-d). Space **must not** re-encode the corpus on startup.

### Retrieval code pattern (HF-native, no LangChain)

LangChain on a free Space is extra RAM and breakages. Use:

```python
from datasets import load_dataset
from sentence_transformers import SentenceTransformer

ds = load_dataset("findexpert-ir/ecoai-knowledge", "embedded", split="train")
ds = ds.add_faiss_index("embeddings")
enc = SentenceTransformer("intfloat/multilingual-e5-small")

q = enc.encode("query: " + user_text, normalize_embeddings=True)
scores, hits = ds.get_nearest_examples("embeddings", q, k=5)
```

E5 **requires** `query:` vs `passage:` prefixes. If we switch to MiniLM, drop prefixes. Put this in one `EMBEDDING_MODE` constant.

### Model card YAML if/when LoRA exists

```yaml
---
license: apache-2.0
base_model: Qwen/Qwen2.5-0.5B-Instruct
datasets:
  - findexpert-ir/ecoai-knowledge
library_name: peft
pipeline_tag: text-generation
language: [fa, en]
---
```

One checkpoint per repo. New task mix = new repo or new adapter file, not overwrite.

### What we still reuse (narrower than before)

**Embed (depend, don’t fork)**  
- [intfloat/multilingual-e5-small](https://huggingface.co/intfloat/multilingual-e5-small) — primary  
- [sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) — fallback  
- [AI-Growth-Lab/PatentSBERTa](https://huggingface.co/AI-Growth-Lab/PatentSBERTa) — phase 2 patent index only  

**Tiny generator (optional Space checkbox)**  
- [alea-institute/kl3m-002-170m-patent](https://huggingface.co/alea-institute/kl3m-002-170m-patent)  

**Do not load in v1 Space**  
- BERT-for-patents, Qwen-14B LoRAs, Prithvi, SEN2SR, CanadaFireSat tensors  

**Related (README links only)**  
- Spaces: [Prithvi burn scars](https://huggingface.co/spaces/ibm-nasa-geospatial/Prithvi-100M-Burn-scars-demo), [NASA FIRMS](https://huggingface.co/spaces/Anjanette030/NASA_FIRMS), [grant-writing-assistant](https://huggingface.co/spaces/vanderbilt-dsi/grant-writing-assistant), [Explainable prior art](https://huggingface.co/spaces/Renukswamy/Explainable-Patent-Prior-Art-Search)  
- Datasets: CanadaFireSat, eo4wildfires, ImpactMesh-Fire, big_patent, allenai/us-patents  

---

## 4. What “better code” should look like (when we write it)

1. **`hf/knowledge/data/train.jsonl`** — 30–80 high-quality rows (grants, RFPs, patent *ideas*, academic stubs, FindExpert tool descriptions). No 25GB npy.  
2. **`hf/knowledge/README.md`** — YAML card + license + related Hub ids.  
3. **`hf/scripts/embed.py`** — encode `passage: {title}\n{text}` with E5, save parquet `embedded`.  
4. **`hf/space/app.py`** — Gradio: query → FAISS → citations; optional Gemini secret for “draft from hits”. No 4-tab fake LoRA.  
5. **`hf/space/README.md`** — `sdk: gradio`, `python_version`, `suggested_hardware: cpu-basic`.  
6. **`hf/space/requirements.txt`** — pin `datasets`, `sentence-transformers`, `faiss-cpu`, `gradio` (no torch GPU, no langchain).  
7. **Skip LoRA folder until** `split_role=sft` rows exist.

Eval later (not v1): small QA set + retrieval hit-rate, as in [HF RAG evaluation cookbook](https://huggingface.co/learn/cookbook/rag_evaluation).

---

## 5. Decision for FindExpert

| Layer | Stays where it is |
| --- | --- |
| Long writing, bots, grant search with web | Gemini + this site + `@FindExperts_bot` |
| Open retrieval over *our* knowledge | HF Dataset + Space |
| Wildfire ML | Topic + Hub **links**, not vendored weights |
| Fine-tune | After dataset quality, not before |

That is a stricter 4-part story: **knowledge → embeddings on that knowledge → Space that searches it → LoRA last.**
