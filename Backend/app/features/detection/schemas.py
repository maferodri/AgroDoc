# Backend/app/features/detection/schemas.py
from pydantic import BaseModel, Field


class TopKPrediction(BaseModel):
    label: str
    confidence: float


class Prediction(BaseModel):
    label: str
    confidence: float
    # Porcentaje ya redondeado para mostrar al usuario (87 equivale a 87%).
    confidence_percent: int = Field(ge=0, le=100)
    top_k: list[TopKPrediction]
    model_version: str
