#!/usr/bin/env python3
"""Fit domain TF-IDF retriever on ecoai-knowledge, export RAG weights + SFT rows.
Cannot train Qwen-0.5B here (no GPU, ~2GB RAM). This is the runnable v1 fine-tune:
a retriever fitted on THIS project's corpus, then RAG uses those weights.
"""
from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "knowledge" / "data" / "train.jsonl"
ENC_DIR = ROOT / "rag_encoder"
SFT_DIR = ROOT / "sft" / "data"
SPACE = ROOT / "space"


def load_kb():
    rows = []
    for line in KB.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def passage(r: dict) -> str:
    return f"{r.get('title', '')}\n{r.get('text', '')}"


SFT = [
    {
        "id": "sft-acad-abstract-en",
        "split_role": "sft",
        "task": "academic",
        "lang": "en",
        "messages": [
            {
                "role": "system",
                "content": "You are FindExpert.ir academic writer. Formal, cited. Use only retrieved sources. Draft, not a published paper.",
            },
            {
                "role": "user",
                "content": "Write an IEEE abstract.\nTitle: Next-day wildfire spread from Sentinel-2 and FIRMS\nNotes: Zagros forests, disaster-response, no Prithvi in production.\nSources:\n[1] NASA FIRMS + Sentinel-2 MSI; cite CanadaFireSat / EO4WildFires, do not copy tensors.\n[2] Method sketch: temporal stack + fire-weather index.",
            },
            {
                "role": "assistant",
                "content": "Abstract—Delayed wildfire detection in mountain forests limits operational response. We outline a next-day spread mapping pipeline that fuses NASA FIRMS active-fire hotspots with Sentinel-2 MSI stacks and a fire-weather index [1], [2]. Related public corpora (CanadaFireSat, EO4WildFires) are cited as evaluation context and are not redistributed. The method is intended for research and grant proposals; large geospatial foundation models are not deployed in the FindExpert.ir service. Index Terms—wildfire, Sentinel-2, FIRMS, disaster response.",
            },
        ],
    },
    {
        "id": "sft-acad-proposal-fa",
        "split_role": "sft",
        "task": "academic",
        "lang": "fa",
        "messages": [
            {
                "role": "system",
                "content": "شما نویسنده علمی FindExpert.ir هستید. فقط از منابع بازیابی‌شده استفاده کنید.",
            },
            {
                "role": "user",
                "content": "بخش پروپوزال پژوهشی را بنویس.\nعنوان: هشدار حریق زاگرس با FIRMS و حسگر محلی\nمنابع:\n[1] حدود ۷٪ اعضای هیئت علمی ایران در پروژه صنعتی فعال‌اند.\n[2] ترکیب نقاط داغ FIRMS با IoT و پهپاد.",
            },
            {
                "role": "assistant",
                "content": "بیان مسئله: تأخیر در کشف حریق جنگل‌های زاگرس زیان اکولوژیک و اقتصادی دارد. شکاف دانشگاه–صنعت در ایران (حدود ۷٪ مشارکت هیئت علمی) مانع انتقال این پژوهش به عملیات است [1]. هدف: سامانه همجوشی نقاط داغ NASA FIRMS با حسگر دود/دما و مسیر پهپاد برای تأیید زمینی [2]. روش: پشته زمانی ماهواره + شاخص هواشناسی آتش؛ ارزیابی روی رخدادهای مستند، بدون کپی دیتاست‌های حجیم. خروجی: پروپوزال IEEE و مسیر اسپین اوت دانش‌بنیان، نه استقرار مدل ۱۰۰میلیونی در سرویس FindExpert.",
            },
        ],
    },
    {
        "id": "sft-grant-need-en",
        "split_role": "sft",
        "task": "grant",
        "lang": "en",
        "messages": [
            {
                "role": "system",
                "content": "You are FindExpert.ir grant writer. Use retrieved sources only.",
            },
            {
                "role": "user",
                "content": "Draft statement of need.\nProject: Community wildfire early warning for Iranian forests.\nSources:\n[1] Adaptation Fund logic: hazard, assets, vulnerable groups, measurable outcomes.\n[2] GEF SGP funds community biodiversity/climate pilots.\n[3] Faculty–industry participation ~7%.",
            },
            {
                "role": "assistant",
                "content": "Statement of need. Zagros and other Iranian forests face delayed fire detection. An adaptation proposal must name the hazard (wildfire), exposed assets (timber, villages, biodiversity), vulnerable groups (rural communities, rangers), and measurable outcomes (time-to-alert) aligned with the country NDA [1]. Community windows such as GEF SGP can fund local pilots [2]. Low faculty participation in industrial projects (~7%) shows why a university–industry platform and field sensors must travel together [3]. We frame FIRMS+IoT as disaster-risk reduction, not as running a foundation model in production.",
            },
        ],
    },
    {
        "id": "sft-patent-claims-en",
        "split_role": "sft",
        "task": "patent",
        "lang": "en",
        "messages": [
            {
                "role": "system",
                "content": "Patent drafting assistant for FindExpert.ir. Not legal advice.",
            },
            {
                "role": "user",
                "content": "Draft independent claim sketch.\nIdea: fuse FIRMS hotspots with IoT smoke sensors and drone waypoint confirmation.\nSources:\n[1] Distinguish fusion + routing from generic satellite monitoring.\n[2] Do not republish BIGPATENT text; search Google Patents.",
            },
            {
                "role": "assistant",
                "content": "Claim 1 (sketch, not legal advice). A method comprising: (a) receiving satellite active-fire alerts; (b) fusing said alerts with on-site smoke and temperature readings; (c) computing a confirmation waypoint for an unmanned aircraft; and (d) emitting an edge alert to a ranger device, wherein the fusion and routing steps are distinct from merely displaying satellite hotspots. Applicants should run a prior-art search on Google Patents and must not copy BIGPATENT corpora [1], [2].",
            },
        ],
    },
    {
        "id": "sft-biz-exec-fa",
        "split_role": "sft",
        "task": "business",
        "lang": "fa",
        "messages": [
            {
                "role": "system",
                "content": "نویسنده طرح دانش‌بنیان FindExpert.ir.",
            },
            {
                "role": "user",
                "content": "خلاصه اجرایی بنویس.\nمنابع:\n[1] فروش کیت حسگر + داشبورد جنگلبان؛ درآمد سخت‌افزار و اشتراک.\n[2] تمایز: FIRMS و رابط فارسی.",
            },
            {
                "role": "assistant",
                "content": "خلاصه اجرایی. شرکت حسگر و داشبورد هشدار حریق را به استان و پارک می‌فروشد. درآمد: کیت + اشتراک SaaS [1]. تمایز نسبت به IoT عمومی: همجوشی FIRMS و تجربه کاربری فارسی [2]. مسیر: پایلوت دانشگاهی، سپس قرارداد صنعتی؛ نگارش طرح کامل در ابزار کسب‌وکار FindExpert.ir.",
            },
        ],
    },
    {
        "id": "sft-rag-howto-en",
        "split_role": "sft",
        "task": "tool",
        "lang": "en",
        "messages": [
            {
                "role": "system",
                "content": "FindExpert.ir assistant. Explain RAG vs writer.",
            },
            {
                "role": "user",
                "content": "Which model is RAG and which is writing?",
            },
            {
                "role": "assistant",
                "content": "RAG = retriever fitted on ecoai-knowledge (TF-IDF v1; E5-small later for dense vectors). Writing = Gemini on FindExpert.ir / @FindExperts_bot, or a future Qwen2.5-0.5B LoRA after hundreds of SFT rows. Do not fine-tune SPECTER2 to write proposals.",
            },
        ],
    },
]


def fit_encoder(rows):
    texts = [passage(r) for r in rows]
    vec = TfidfVectorizer(lowercase=True, ngram_range=(1, 2), min_df=1, max_features=12000)
    X = vec.fit_transform(texts)
    vocab = vec.get_feature_names_out().tolist()
    idf = vec.idf_.astype(float).tolist()
    # sparse rows as {index: tfidf} for JS
    docs = []
    for i, r in enumerate(rows):
        start, end = X.indptr[i], X.indptr[i + 1]
        weights = {int(j): float(v) for j, v in zip(X.indices[start:end], X.data[start:end])}
        docs.append(
            {
                "id": r["id"],
                "doc_type": r.get("doc_type"),
                "lang": r.get("lang"),
                "title": r.get("title"),
                "text": r.get("text"),
                "url": r.get("url"),
                "tags": r.get("tags", []),
                "w": weights,
            }
        )
    export = {
        "kind": "tfidf-cosine",
        "project": "FindExpert.ir ecoAI",
        "fitted_on": "sosa123454321/ecoai-knowledge",
        "ngram_range": [1, 2],
        "vocab": vocab,
        "idf": idf,
        "docs": docs,
    }
    # sanity
    q = vec.transform(["wildfire FIRMS Sentinel proposal Zagros"])
    sim = cosine_similarity(q, X).ravel()
    top = int(np.argmax(sim))
    print("sanity top:", rows[top]["id"], "score", round(float(sim[top]), 3))
    return vec, X, export


def main():
    rows = load_kb()
    vec, X, export = fit_encoder(rows)

    ENC_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump({"vectorizer": vec, "matrix": X, "ids": [r["id"] for r in rows]}, ENC_DIR / "encoder.joblib")
    (ENC_DIR / "encoder.json").write_text(json.dumps(export, ensure_ascii=False), encoding="utf-8")
    (SPACE / "encoder.json").write_text(json.dumps(export, ensure_ascii=False), encoding="utf-8")

    SFT_DIR.mkdir(parents=True, exist_ok=True)
    with (SFT_DIR / "train.jsonl").open("w", encoding="utf-8") as f:
        for row in SFT:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    print("sft", len(SFT), "kb", len(rows), "vocab", len(export["vocab"]))


if __name__ == "__main__":
    main()
