from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


REPO_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = REPO_ROOT / "ml" / "artifacts" / "model.joblib"


def predict_from_json(model, payload: dict) -> dict:
    df = pd.DataFrame([payload])
    proba = float(model.predict_proba(df)[:, 1][0])
    pred = int(proba >= 0.5)
    return {"pred": pred, "risk_probability": proba}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default=str(MODEL_PATH), help="Path to model.joblib")
    parser.add_argument(
        "--json",
        type=str,
        default="",
        help="JSON string with feature values (must match training feature names).",
    )
    args = parser.parse_args()

    model_path = Path(args.model).expanduser().resolve()
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}. Run: python ml/train.py")

    model = joblib.load(model_path)

    if not args.json:
        example = {
            "commits_7d": 4,
            "prs_7d": 1,
            "issues_7d": 6,
            "reviews_7d": 2,
            "active_days_14d": 3,
            "repo_age_days": 420,
        }
        print("No --json provided. Example:")
        print(json.dumps(example, indent=2))
        result = predict_from_json(model, example)
        print(json.dumps(result, indent=2))
        return

    payload = json.loads(args.json)
    result = predict_from_json(model, payload)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
