"""Endpoints HTTP del módulo detection.

La inferencia se consume normalmente desde el módulo `diagnosis`, pero aquí se
expone además un endpoint directo que el frontend usa para enviar una imagen y
obtener la predicción del modelo ONNX (`ml/export/model.onnx`) sin depender del
resto de slices. Contrato: `docs/openapi.yaml` (`/detection/predict`).
"""

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.features.detection import service
from app.features.detection.schemas import Prediction
from app.shared.schemas import ModuleHealth

router = APIRouter(tags=["detection"])

# Límite defensivo: una foto de hoja no debería superar 10 MB.
MAX_IMAGE_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.get(
    "/detection/health",
    response_model=ModuleHealth,
    summary="Estado del módulo detection",
)
def module_health() -> ModuleHealth:
    return service.health()


@router.post(
    "/detection/predict",
    response_model=Prediction,
    summary="Clasificar una imagen de cultivo con el modelo ONNX",
    description=(
        "Recibe una imagen (`multipart/form-data`, campo `file`), la preprocesa "
        "con los metadatos embebidos en el ONNX y devuelve la plaga detectada, "
        "la confianza y las mejores `top_k` predicciones."
    ),
)
async def predict_image(file: UploadFile = File(...)) -> Prediction:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Formato de imagen no soportado. Usa JPEG, PNG o WEBP "
                f"(recibido: {file.content_type or 'desconocido'})."
            ),
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo de imagen está vacío.",
        )
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="La imagen supera el máximo de 10 MB.",
        )

    return service.predict(image_bytes)
