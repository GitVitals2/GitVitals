from __future__ import annotations

from typing import Dict, List, Tuple, Optional

import numpy as np


def _height_total_in(height_ft: Optional[int], height_in: Optional[float]) -> Optional[float]:
    if height_ft is None and height_in is None:
        return None
    ft = float(height_ft or 0)
    inch = float(height_in or 0)
    total = ft * 12.0 + inch
    return total if total > 0 else None


def _bmi(weight_lb: Optional[float], height_in_total: Optional[float]) -> Optional[float]:
    if weight_lb is None or height_in_total is None or height_in_total <= 0:
        return None
    return (float(weight_lb) / (height_in_total ** 2)) * 703.0


def build_feature_dict(v: Dict) -> Dict[str, float]:
    age = float(v.get("age_years", 0.0))
    hr = float(v.get("heart_rate", 0.0))
    rr = float(v.get("resp_rate", 0.0))
    temp = float(v.get("temp_f", 0.0))
    spo2 = float(v.get("spo2_pct", 0.0))
    sys = float(v.get("systolic_bp", 0.0))
    dia = float(v.get("diastolic_bp", 0.0))
    pain = float(v.get("pain_0_10", 0.0))

    h_total = _height_total_in(v.get("height_ft"), v.get("height_in"))
    w_lb = v.get("weight_lb")
    w_lb = float(w_lb) if w_lb is not None else None

    bmi = _bmi(w_lb, h_total)

    pulse_pressure = sys - dia
    map_est = dia + (pulse_pressure / 3.0)

    f: Dict[str, float] = {
        "age_years": age,
        "heart_rate": hr,
        "resp_rate": rr,
        "temp_f": temp,
        "spo2_pct": spo2,
        "systolic_bp": sys,
        "diastolic_bp": dia,
        "pain_0_10": pain,
        "pulse_pressure": pulse_pressure,
        "map_est": map_est,
        "hr_x_age": hr * age,
        "rr_x_age": rr * age,
        "sys_x_age": sys * age,
        "dia_x_age": dia * age,
        "height_total_in": float(h_total) if h_total is not None else 0.0,
        "weight_lb": float(w_lb) if w_lb is not None else 0.0,
        "bmi": float(bmi) if bmi is not None else 0.0,
    }
    return f


FEATURE_ORDER: List[str] = [
    "age_years",
    "heart_rate",
    "resp_rate",
    "temp_f",
    "spo2_pct",
    "systolic_bp",
    "diastolic_bp",
    "pain_0_10",
    "pulse_pressure",
    "map_est",
    "hr_x_age",
    "rr_x_age",
    "sys_x_age",
    "dia_x_age",
    "height_total_in",
    "weight_lb",
    "bmi",
]


def vectorize(v: Dict) -> Tuple[np.ndarray, List[str]]:
    fd = build_feature_dict(v)
    x = np.array([fd[name] for name in FEATURE_ORDER], dtype=float)
    return x, FEATURE_ORDER
