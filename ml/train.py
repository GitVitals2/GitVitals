from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    balanced_accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    # For static analysis / type checkers, prefer the package import
    from ml.data_loader import load_training_data_from_db  # pragma: no cover
else:
    # Runtime: try package import first, then fallback to local module import
    try:
        from ml.data_loader import load_training_data_from_db
    except Exception:
        from data_loader import load_training_data_from_db

REPO_ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS_DIR = REPO_ROOT / "ml" / "artifacts"
EVAL_REPORT_PATH = ARTIFACTS_DIR / "eval_report.json"

@dataclass(frozen=True)
class TrainOutputs:
    model_path: Path
    metrics_path: Path


def make_synthetic_data(n: int = 2000, seed: int = 7) -> pd.DataFrame:
    """Generate synthetic medical vitals data with age-aware variation."""
    rng = np.random.default_rng(seed)

    age_years = rng.uniform(0, 100, size=n)
    age_factor = np.clip((age_years - 18) / 50, 0, 1)

    bp_systolic = rng.integers(90, 180, size=n) + (age_factor * 12)
    bp_diastolic = rng.integers(60, 110, size=n) + (age_factor * 6)
    heart_rate = rng.integers(50, 120, size=n) + (age_years < 12) * 15
    temperature = rng.uniform(96.0, 102.0, size=n)
    respiratory_rate = rng.integers(10, 30, size=n) + (age_years < 2) * 6
    oxygen_saturation = rng.integers(85, 100, size=n)
    pulse_pressure = bp_systolic - bp_diastolic
    pain_level = rng.integers(0, 11, size=n)

    risk_score = (
        0.18 * ((bp_systolic > 140) | (bp_systolic < 90)).astype(int)
        + 0.14 * ((bp_diastolic > 90) | (bp_diastolic < 60)).astype(int)
        + 0.18 * (heart_rate > 100).astype(int)
        + 0.14 * (temperature > 100.4).astype(int)
        + 0.10 * (respiratory_rate > 20).astype(int)
        + 0.10 * (oxygen_saturation < 95).astype(int)
        + 0.10 * (pain_level >= 7).astype(int)
        + 0.06 * (age_years > 70).astype(int)
    ) + rng.normal(0, 0.12, size=n)

    at_risk = (risk_score >= 0.45).astype(int)

    return pd.DataFrame({
        "age_years": age_years.round(1),
        "bp_systolic": bp_systolic,
        "bp_diastolic": bp_diastolic,
        "heart_rate": heart_rate,
        "temperature": temperature,
        "respiratory_rate": respiratory_rate,
        "oxygen_saturation": oxygen_saturation,
        "pulse_pressure": pulse_pressure,
        "pain_level": pain_level,
        "at_risk": at_risk,
    })


def age_group(age: float) -> str:
    if age < 1:
        return "neonate"
    if age < 13:
        return "child"
    if age < 18:
        return "teen"
    if age < 65:
        return "adult"
    return "senior"


def best_threshold(y_true: np.ndarray, prob: np.ndarray) -> float:
    candidates = np.linspace(0.1, 0.9, 81)
    best_t = 0.5
    best_f1 = -1.0
    for t in candidates:
        pred = (prob >= t).astype(int)
        score = f1_score(y_true, pred, zero_division=0)
        if score > best_f1:
            best_f1 = score
            best_t = t
    return float(best_t)


def load_data(source: str, csv_path: Path | None = None, limit: int | None = None) -> pd.DataFrame:
    """Load training data from specified source."""
    if source == "db":
        return load_training_data_from_db(limit=limit)
    if source == "csv":
        if csv_path is None or not csv_path.exists():
            raise FileNotFoundError(f"CSV not found: {csv_path}")
        df = pd.read_csv(csv_path)
        if "at_risk" not in df.columns:
            raise ValueError("CSV must include target column 'at_risk'")
        return df
    if source == "synthetic":
        return make_synthetic_data()
    raise ValueError(f"Invalid source: {source}")


def train_model(df: pd.DataFrame, seed: int = 7, threshold: float = 0.5) -> dict:
    if "age_years" not in df.columns:
        raise ValueError("Training data must include age_years column.")

    feature_cols = [c for c in df.columns if c != "at_risk"]
    X = df[feature_cols].astype(float)
    y = df["at_risk"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=seed, stratify=y
    )

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=2000, class_weight="balanced")),
    ])
    model.fit(X_train, y_train)

    prob = model.predict_proba(X_test)[:, 1]

    age_groups = pd.Series(X_test["age_years"].values, index=X_test.index).map(age_group)
    group_thresholds = {
        group: best_threshold(y_test[age_groups == group], prob[age_groups == group])
        for group in sorted(age_groups.unique())
    }

    pred = (prob >= threshold).astype(int)

    cm = confusion_matrix(y_test, pred, labels=[0, 1])
    tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])

    eval_report = {
        "overall": {
            "accuracy": float(accuracy_score(y_test, pred)),
            "balanced_accuracy": float(balanced_accuracy_score(y_test, pred)),
            "precision": float(precision_score(y_test, pred, zero_division=0)),
            "recall": float(recall_score(y_test, pred, zero_division=0)),
            "f1": float(f1_score(y_test, pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, prob)),
            "pr_auc": float(average_precision_score(y_test, prob)),
            "confusion_matrix": {"tn": tn, "fp": fp, "fn": fn, "tp": tp},
        },
        "age_group_thresholds": group_thresholds,
    }

    return {
        "model": model,
        "metrics": {
            "n_rows": int(df.shape[0]),
            "n_features": int(X.shape[1]),
            "positive_rate": float(y.mean()),
            "threshold": float(threshold),
            "age_group_thresholds": group_thresholds,
            "accuracy": float(accuracy_score(y_test, pred)),
            "balanced_accuracy": float(balanced_accuracy_score(y_test, pred)),
            "precision": float(precision_score(y_test, pred, zero_division=0)),
            "recall": float(recall_score(y_test, pred, zero_division=0)),
            "f1": float(f1_score(y_test, pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, prob)),
            "pr_auc": float(average_precision_score(y_test, prob)),
            "confusion_matrix": {"tn": tn, "fp": fp, "fn": fn, "tp": tp},
            "feature_names": feature_cols,
        },
        "eval_report": eval_report,
    }


def save_artifacts(model, metrics: dict, eval_report: dict | None = None) -> TrainOutputs:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = ARTIFACTS_DIR / "model.joblib"
    metrics_path = ARTIFACTS_DIR / "metrics.json"
    joblib.dump(model, model_path)
    metrics_path.write_text(json.dumps(metrics, indent=2))
    if eval_report is not None:
        EVAL_REPORT_PATH.write_text(json.dumps(eval_report, indent=2))
    return TrainOutputs(model_path=model_path, metrics_path=metrics_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train ML model for vitals risk prediction")
    parser.add_argument("--source", choices=["db", "csv", "synthetic"], default="db")
    parser.add_argument("--csv", type=str, default="")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--threshold", type=float, default=0.5)
    args = parser.parse_args()

    csv_path = Path(args.csv).expanduser().resolve() if args.csv else None
    df = load_data(args.source, csv_path, args.limit if args.source == "db" else None)
    out = train_model(df, threshold=args.threshold)
    outputs = save_artifacts(out["model"], out["metrics"], out.get("eval_report"))

    print(" Training complete")
    print(f" Source: {args.source}")
    print(f" Model:   {outputs.model_path}")
    print(f" Metrics: {outputs.metrics_path}")
    print(json.dumps(out["metrics"], indent=2))


if __name__ == "__main__":
    main()
