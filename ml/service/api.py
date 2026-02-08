from pathlib import Path

import joblib
from fastapi import FastAPI

from ml.predict import get_feature_names, load_metrics, predict_from_json
from service.schemas import PredictOut, VitalsIn

REPO_ROOT = Path(__file__).resolve().parents[2]

app = FastAPI(title="GitVitals ML Service", version="0.1.0")

metrics = load_metrics()
model_path = REPO_ROOT / "ml" / "artifacts" / "model.joblib"
model = joblib.load(model_path)
feature_names = get_feature_names(model, metrics)
threshold = float(metrics.get("threshold", 0.5))


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/predict", response_model=PredictOut)
def predict(v: VitalsIn):
    payload = {
        "age_years": v.age_years,
        "bp_systolic": v.systolic_bp,
        "bp_diastolic": v.diastolic_bp,
        "heart_rate": v.heart_rate,
        "temperature": v.temp_f,
        "respiratory_rate": v.resp_rate,
        "oxygen_saturation": v.spo2_pct,
        "pulse_pressure": v.systolic_bp - v.diastolic_bp,
        "pain_level": v.pain_0_10,
    }

    result = predict_from_json(model, payload, feature_names, threshold, metrics)
    return PredictOut(
        p_flag=result["risk_probability"],
        pred_flag=result["pred"],
        threshold=result["threshold"],
        reasons=["Risk probability compared to threshold"],
        model_version="0.1.0",
    )
