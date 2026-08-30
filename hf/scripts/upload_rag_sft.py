#!/usr/bin/env python3
import os
import sys
from pathlib import Path

from huggingface_hub import HfApi

ROOT = Path(__file__).resolve().parents[1]
USER = "sosa123454321"
COL = "sosa123454321/findexpertir-ecoai-6a92c5e90582edd20ab09e6f"


def main() -> int:
    token = os.environ.get("HF_TOKEN")
    if not token:
        print("HF_TOKEN missing", file=sys.stderr)
        return 1
    api = HfApi(token=token)

    sft = f"{USER}/ecoai-sft"
    enc = f"{USER}/ecoai-rag-encoder"
    sp = f"{USER}/ecoai-space"

    api.create_repo(sft, repo_type="dataset", exist_ok=True, private=False)
    api.upload_folder(folder_path=str(ROOT / "sft"), repo_id=sft, repo_type="dataset", commit_message="FindExpert SFT instruction rows for future Qwen-0.5B LoRA")
    print("sft", sft)

    api.create_repo(enc, repo_type="model", exist_ok=True, private=False)
    api.upload_folder(folder_path=str(ROOT / "rag_encoder"), repo_id=enc, repo_type="model", commit_message="Fitted TF-IDF retriever on ecoai-knowledge")
    print("encoder", enc)

    api.upload_folder(folder_path=str(ROOT / "space"), repo_id=sp, repo_type="space", commit_message="RAG Space using fitted encoder.json + draft-from-hits")
    print("space", sp)

    for item_type, item_id in (("dataset", sft), ("model", enc)):
        try:
            api.add_collection_item(COL, item_id=item_id, item_type=item_type, exists_ok=True)
        except Exception as e:
            print("collection", item_id, e)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
