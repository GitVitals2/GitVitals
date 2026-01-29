from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


REPO_ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS_DIR = REPO_ROOT / "ml" / "artifacts"
DATA_DIR = REPO_ROOT / "ml" / "data"


@dataclass(frozen=True)
class TrainOutputs:
    model_path: Path
    metrics_path: Path


def make_synthetic_data(n: int = 2000, seed: int = 7) -> pd.DataFrame:
    """
    Synthetic dataset with GitVitals-ish signals.
    Replace this later with real features from DB/logs.
    """
    rng = np.random.default_rng(seed)

    commits_7d = rng.poisson(lam=12, size=n)
    prs_7d = rng.poisson(lam=3, size=n)
    issues_7d = rng.poisson(lam=4, size=n)
    reviews_7d = rng.poisson(lam=6, size=n)
    active_days_14d = rng.integers(1, 15, size=n)
    repo_age_days = rng.integers(30, 3000, size=n)
    risk_score = (
        0.35 * (commits_7d < 6).astype(int)
        + 0.25 * (prs_7d < 2).astype(int)
        + 0.20 * (reviews_7d < 3).astype(int)
        + 0.10 * (active_days_14d < 5).astype(int)
        + 0.10 * (issues_7d > 8).astype(int)
    )

    # Add noise so it’s not perfectly separable
    risk_score = risk_score + rng.normal(0, 0.15, size=n)

    at_risk = (risk_score >= 0.55).astype(int)

    df = pd.DataFrame(
        {
            "commits_7d": commits_7d,
            "prs_7d": prs_7d,
            "issues_7d": issues_7d,
            "reviews_7d": reviews_7d,
            "active_days_14d": active_days_14d,
            "repo_age_days": repo_age_days,
            "at_risk": at_risk,
        }
    )
    return df


def load_data(csv_path: Path | None) -> pd.DataFrame:
    if csv_path is None:
        return make_synthetic_data()
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")
    df = pd.read_csv(csv_path)
    if "at_risk" not in df.columns:
        raise ValueError("Your CSV must include a target column named 'at_risk' (0/1).")
    return df


def train_model(df: pd.DataFrame, seed: int = 7) -> dict:
    feature_cols = [c for c in df.columns if c != "at_risk"]
    X = df[feature_cols].astype(float)
    y = df["at_risk"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=seed, stratify=y
    )

    model = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=2000, class_weight="balanced")),
        ]
    )
    model.fit(X_train, y_train)

    proba = model.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)

    metrics = {
        "n_rows": int(df.shape[0]),
        "n_features": int(X.shape[1]),
        "positive_rate": float(y.mean()),
        "accuracy": float(accuracy_score(y_test, pred)),
        "precision": float(precision_score(y_test, pred, zero_division=0)),
        "recall": float(recall_score(y_test, pred, zero_division=0)),
        "f1": float(f1_score(y_test, pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, proba)),
        "feature_names": feature_cols,
    }

    return {"model": model, "metrics": metrics}


def save_artifacts(model, metrics: dict) -> TrainOutputs:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    model_path = ARTIFACTS_DIR / "model.joblib"
    metrics_path = ARTIFACTS_DIR / "metrics.json"

    joblib.dump(model, model_path)
    metrics_path.write_text(json.dumps(metrics, indent=2))

    return TrainOutputs(model_path=model_path, metrics_path=metrics_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=str, default="", help="Optional: path to training CSV.")
    args = parser.parse_args()

    csv_path = Path(args.csv).expanduser().resolve() if args.csv else None

    df = load_data(csv_path)
    out = train_model(df)
    outputs = save_artifacts(out["model"], out["metrics"])

    print("✅ Training complete")
    print(f"Model:   {outputs.model_path}")
    print(f"Metrics: {outputs.metrics_path}")
    print(json.dumps(out["metrics"], indent=2))


if __name__ == "__main__":
    main()
