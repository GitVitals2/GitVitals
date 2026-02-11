from fastapi.testclient import TestClient
from service.api import app

def get_client():
    return TestClient(app)

def test_health_endpoint():
    client = get_client()
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}

def test_predict_valid():
    client = get_client()
    payload = {"age_years": 30, "heart_rate": 72, "resp_rate": 16, "temp_f": 98.6, "spo2_pct": 98, "systolic_bp": 120, "diastolic_bp": 80, "height_ft": 5, "height_in": 8, "weight_lb": 160, "pain_0_10": 2}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "p_flag" in data
    assert "pred_flag" in data


def test_predict_high_risk():
    client = get_client()
    payload = {"age_years": 85, "heart_rate": 120, "resp_rate": 28, "temp_f": 102.5, "spo2_pct": 88, "systolic_bp": 180, "diastolic_bp": 110, "height_ft": 5, "height_in": 6, "weight_lb": 170, "pain_0_10": 9}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "p_flag" in data


def test_predict_child():
    client = get_client()
    payload = {"age_years": 5, "heart_rate": 90, "resp_rate": 22, "temp_f": 99.1, "spo2_pct": 97, "systolic_bp": 95, "diastolic_bp": 62, "height_ft": 3, "height_in": 8, "weight_lb": 45, "pain_0_10": 4}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200


def test_predict_teen():
    client = get_client()
    payload = {"age_years": 15, "heart_rate": 75, "resp_rate": 18, "temp_f": 98.3, "spo2_pct": 99, "systolic_bp": 112, "diastolic_bp": 72, "height_ft": 5, "height_in": 4, "weight_lb": 125, "pain_0_10": 1}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200


def test_predict_senior():
    client = get_client()
    payload = {"age_years": 78, "heart_rate": 68, "resp_rate": 16, "temp_f": 97.9, "spo2_pct": 96, "systolic_bp": 142, "diastolic_bp": 86, "height_ft": 5, "height_in": 7, "weight_lb": 165, "pain_0_10": 3}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200


def test_predict_neonate():
    client = get_client()
    payload = {"age_years": 0.08, "heart_rate": 130, "resp_rate": 35, "temp_f": 98.8, "spo2_pct": 96, "systolic_bp": 75, "diastolic_bp": 50, "height_ft": 1, "height_in": 8, "weight_lb": 8, "pain_0_10": 0}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200


def test_predict_boundary_low():
    client = get_client()
    payload = {"age_years": 18, "heart_rate": 60, "resp_rate": 12, "temp_f": 97.0, "spo2_pct": 99, "systolic_bp": 110, "diastolic_bp": 70, "height_ft": 5, "height_in": 10, "weight_lb": 150, "pain_0_10": 0}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200


def test_predict_boundary_high():
    client = get_client()
    payload = {"age_years": 64, "heart_rate": 85, "resp_rate": 20, "temp_f": 99.5, "spo2_pct": 95, "systolic_bp": 138, "diastolic_bp": 88, "height_ft": 6, "height_in": 0, "weight_lb": 200, "pain_0_10": 5}
    response = client.post("/predict", json=payload)
    assert response.status_code == 200


def test_health_multiple_calls():
    client = get_client()
    for i in range(3):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["ok"] is True


def test_predict_response_format():
    client = get_client()
    payload = {"age_years": 42, "heart_rate": 74, "resp_rate": 15, "temp_f": 98.5, "spo2_pct": 98, "systolic_bp": 125, "diastolic_bp": 82, "height_ft": 5, "height_in": 9, "weight_lb": 175, "pain_0_10": 2}
    response = client.post("/predict", json=payload)
    data = response.json()
    
    assert isinstance(data["p_flag"], (int, float))
    assert isinstance(data["pred_flag"], (int, bool))
    assert isinstance(data["threshold"], (int, float))
    assert isinstance(data["reasons"], list)
    assert isinstance(data["model_version"], str)
    assert len(data["reasons"]) > 0


def test_predict_various_ages():
    client = get_client()
    ages = [0.5, 5, 13, 18, 30, 50, 65, 80, 95]
    
    for age in ages:
        payload = {
            "age_years": age,
            "heart_rate": 75,
            "resp_rate": 16,
            "temp_f": 98.6,
            "spo2_pct": 97,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "height_ft": 5,
            "height_in": 6,
            "weight_lb": 150,
            "pain_0_10": 2
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 200


def test_predict_extreme_vitals():
    client = get_client()
    
    payloads = [
        {"age_years": 90, "heart_rate": 150, "resp_rate": 35, "temp_f": 104, "spo2_pct": 85, "systolic_bp": 200, "diastolic_bp": 120, "height_ft": 5, "height_in": 5, "weight_lb": 250, "pain_0_10": 10},
        {"age_years": 20, "heart_rate": 50, "resp_rate": 10, "temp_f": 96, "spo2_pct": 100, "systolic_bp": 90, "diastolic_bp": 60, "height_ft": 6, "height_in": 2, "weight_lb": 120, "pain_0_10": 0}
    ]
    
    for payload in payloads:
        response = client.post("/predict", json=payload)
        assert response.status_code == 200


def test_health_concurrent_requests():
    client = get_client()
    responses = [client.get("/health") for _ in range(10)]
    assert all(r.status_code == 200 for r in responses)


def test_predict_concurrent_requests():
    client = get_client()
    payload = {"age_years": 35, "heart_rate": 70, "resp_rate": 14, "temp_f": 98.4, "spo2_pct": 98, "systolic_bp": 118, "diastolic_bp": 76, "height_ft": 5, "height_in": 10, "weight_lb": 165, "pain_0_10": 1}
    
    responses = [client.post("/predict", json=payload) for _ in range(5)]
    assert all(r.status_code == 200 for r in responses)
    
    results = [r.json()["p_flag"] for r in responses]
    assert len(set(results)) == 1


def test_predict_model_version():
    client = get_client()
    payload = {"age_years": 40, "heart_rate": 72, "resp_rate": 16, "temp_f": 98.6, "spo2_pct": 98, "systolic_bp": 120, "diastolic_bp": 80, "height_ft": 5, "height_in": 9, "weight_lb": 170, "pain_0_10": 2}
    response = client.post("/predict", json=payload)
    data = response.json()
    
    assert "model_version" in data
    assert data["model_version"] == "0.1.0"
