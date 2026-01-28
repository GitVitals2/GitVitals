from pydantic import BaseModel, Field
from typing import Optional, List


class VitalsIn(BaseModel):
    # Context
    age_years: float = Field(..., ge=0)

    # Core vitals
    heart_rate: float = Field(..., ge=0)
    resp_rate: float = Field(..., ge=0)
    temp_f: float
    spo2_pct: float = Field(..., ge=0, le=100)
    systolic_bp: float = Field(..., ge=0)
    diastolic_bp: float = Field(..., ge=0)

    # US units
    height_ft: int = Field(..., ge=0)
    height_in: float = Field(..., ge=0)
    weight_lb: float = Field(..., ge=0)

    # Other
    pain_0_10: float = Field(..., ge=0, le=10)

    # Infant only (optional)
    length_in: Optional[float] = Field(default=None, ge=0)
    head_circumference_in: Optional[float] = Field(default=None, ge=0)


class PredictOut(BaseModel):
    p_flag: float
    pred_flag: int
    threshold: float
    reasons: List[str]
    model_version: str
