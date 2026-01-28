from fastapi import FastAPI
from service.schemas import VitalsIn, PredictOut

app = FastAPI(title="GitVitals ML Service", version="0.1.0")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/predict", response_model=PredictOut)
def predict(v: VitalsIn):
    # Stub mode: fixed outputs so the pipeline is testable before the model exists.
    return PredictOut(
        p_flag=0.10,
        pred_flag=0,
        threshold=0.70,
        reasons=["Stub mode (model not loaded yet)"],
        model_version="0.1.0-stub",
    )
