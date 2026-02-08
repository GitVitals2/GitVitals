from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = REPO_ROOT / "ml" / "artifacts" / "model.joblib"
METRICS_PATH = REPO_ROOT / "ml" / "artifacts" / "metrics.json"


def load_metrics() -> dict[str, Any]:
    if not METRICS_PATH.exists():
        raise FileNotFoundError(
            f"Metrics not found: {METRICS_PATH}. Run training first to create it."
        )
    data = json.loads(METRICS_PATH.read_text())
    if not isinstance(data, dict):
        raise ValueError("metrics.json is not a JSON object")
    return data


def get_feature_names(model: Any, metrics: dict[str, Any]) -> list[str]:
    # Best case: sklearn stores feature names when trained on a DataFrame
    names = getattr(model, "feature_names_in_", None)
    if names is not None:
        return [str(x) for x in list(names)]

    # Fallback: read the metrics artifact (created by train.py)
    if "feature_names" in metrics:
        return [str(x) for x in metrics["feature_names"]]

    raise RuntimeError(
        "Could not determine feature names. Re-train first: python ml/train.py "
        "and make sure ml/artifacts/metrics.json exists."
    )


def _coerce_payload(payload: dict[str, Any], feature_names: list[str]) -> dict[str, Any]:
    data = dict(payload)
    if "pulse_pressure" not in data:
        if "bp_systolic" in data and "bp_diastolic" in data:
            try:
                data["pulse_pressure"] = float(data["bp_systolic"]) - float(data["bp_diastolic"])
            except Exception:
                pass
    return data


def _age_group(age: float) -> str:
    if age < 1:
        return "neonate"
    if age < 13:
        return "child"
    if age < 18:
        return "teen"
    if age < 65:
        return "adult"
    return "senior"


def _resolve_threshold(metrics: dict[str, Any], payload: dict[str, Any], default_threshold: float) -> float:
    thresholds = metrics.get("age_group_thresholds")
    if not isinstance(thresholds, dict):
        return default_threshold
    age_val = payload.get("age_years")
    if age_val is None:
        return default_threshold
    try:
        group = _age_group(float(age_val))
    except Exception:
        return default_threshold
    return float(thresholds.get(group, default_threshold))


def predict_from_json(
    model: Any,
    payload: dict[str, Any],
    feature_names: list[str],
    threshold: float,
    metrics: dict[str, Any] | None = None,
) -> dict[str, Any]:
    data = _coerce_payload(payload, feature_names)
    payload_keys = set(data.keys())
    expected_keys = set(feature_names)

    missing = sorted(expected_keys - payload_keys)
    extra = sorted(payload_keys - expected_keys)

    if missing:
        msg = {
            "error": "Missing required features",
            "missing": missing,
            "expected_feature_names": feature_names,
        }
        raise ValueError(json.dumps(msg, indent=2))

    # Enforce column order + numeric conversion
    try:
        df = pd.DataFrame([{k: data[k] for k in feature_names}], columns=feature_names).astype(float)
    except Exception as exc:
        raise ValueError(f"Non-numeric feature value: {exc}") from exc

    threshold_used = _resolve_threshold(metrics or {}, data, threshold)

    prob = float(model.predict_proba(df)[:, 1][0])
    pred = int(prob >= threshold_used)
    return {
        "pred": pred,
        "risk_probability": prob,
        "threshold": threshold_used,
        "extra_fields_ignored": extra,
    }


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

    metrics = load_metrics()
    model = joblib.load(model_path)
    feature_names = get_feature_names(model, metrics)
    threshold = float(metrics.get("threshold", 0.5))

    if not args.json:
        # Build a safe example matching the trained feature names
        defaults = {
            "age_years": 30,
            "bp_systolic": 120,
            "bp_diastolic": 80,
            "heart_rate": 72,
            "temperature": 98.6,
            "respiratory_rate": 16,
            "oxygen_saturation": 98,
            "pulse_pressure": 40,
            "pain_level": 2,
        }
        example = {name: float(defaults.get(name, 0)) for name in feature_names}

        print("No --json provided.")
        print("Expected feature names:")
        print(json.dumps(feature_names, indent=2))
        print("Example payload:")
        print(json.dumps(example, indent=2))

        result = predict_from_json(model, example, feature_names, threshold, metrics)
        print(json.dumps(result, indent=2))
        return

    try:
        payload = json.loads(args.json)
        if not isinstance(payload, dict):
            raise ValueError("Payload must be a JSON object (dictionary).")

        result = predict_from_json(model, payload, feature_names, threshold, metrics)
        print(json.dumps(result, indent=2))

    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
