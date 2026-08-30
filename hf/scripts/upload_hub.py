#!/usr/bin/env python3
"""Create/upload ecoai-knowledge dataset + ecoai-space (static). Token from HF_TOKEN."""
from __future__ import annotations

import os
import sys
from pathlib import Path

from huggingface_hub import HfApi, errors

ROOT = Path(__file__).resolve().parents[1]
USER = "sosa123454321"
DS = f"{USER}/ecoai-knowledge"
SP = f"{USER}/ecoai-space"


def main() -> int:
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if not token:
        print("HF_TOKEN missing", file=sys.stderr)
        return 1
    api = HfApi(token=token)

    print("create dataset", DS)
    api.create_repo(DS, repo_type="dataset", exist_ok=True, private=False)
    api.upload_folder(
        folder_path=str(ROOT / "knowledge"),
        repo_id=DS,
        repo_type="dataset",
        commit_message="FindExpert ecoAI knowledge JSONL (grants, patents, academic, tools)",
        ignore_patterns=[".git*", "__pycache__"],
    )
    print("dataset ok https://huggingface.co/datasets/" + DS)

    print("create space", SP)
    try:
        api.create_repo(SP, repo_type="space", space_sdk="static", exist_ok=True, private=False)
    except Exception as e:
        print("create_repo space:", e)
        try:
            api.create_repo(SP, repo_type="space", exist_ok=True, private=False)
        except Exception as e2:
            print("space create failed", e2)
            return 1
    api.upload_folder(
        folder_path=str(ROOT / "space"),
        repo_id=SP,
        repo_type="space",
        commit_message="Static FindExpert ecoAI search Space",
        ignore_patterns=[".git*", "__pycache__"],
    )
    print("space ok https://huggingface.co/spaces/" + SP)

    try:
        col = api.create_collection(
            title="FindExpert.ir ecoAI",
            namespace=USER,
            description="Knowledge dataset + static search Space for FindExpert.ir. Generation stays on the site and @FindExperts_bot.",
            exist_ok=True,
            private=False,
        )
        slug = col.slug if hasattr(col, "slug") else getattr(col, "id", None)
        print("collection", col)
        if slug:
            for item_type, item_id in (("dataset", DS), ("space", SP)):
                try:
                    api.add_collection_item(slug, item_id=item_id, item_type=item_type, exists_ok=True)
                except TypeError:
                    api.add_collection_item(collection_slug=slug, item_id=item_id, item_type=item_type)
                except Exception as e:
                    print("add item", item_id, e)
    except Exception as e:
        print("collection skipped:", type(e).__name__, e)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
