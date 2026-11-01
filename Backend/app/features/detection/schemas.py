
# Backend/app/features/detection/schemas.py
from pydantic import BaseModel


class TopKPrediction(BaseModel):
    label: str
    confidence: float


class Prediction(BaseModel):
    label: str
    confidence: float
    top_k: list[TopKPrediction]
    model_version: str
