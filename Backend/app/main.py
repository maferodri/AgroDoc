"""Punto de entrada del monolito AgroDoc.

Un único proceso FastAPI monta un router por slice vertical. Si un módulo no
importa correctamente, la aplicación no arranca: no hay despliegues parciales
como en la arquitectura de microservicios anterior.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.features.auth.router import router as auth_router
from app.features.consultations.router import router as consultations_router
from app.features.crops.router import router as crops_router
from app.features.detection.router import router as detection_router
from app.features.diagnosis.router import router as diagnosis_router
from app.shared.schemas import HealthResponse

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    openapi_url=f"{settings.api_prefix}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

ROUTERS = (
    auth_router,
    crops_router,
    detection_router,
    diagnosis_router,
    consultations_router,
)

for router in ROUTERS:
    app.include_router(router, prefix=settings.api_prefix)


@app.get("/health", response_model=HealthResponse, tags=["infra"])
def health() -> HealthResponse:
    """Salud del proceso completo (liveness)."""
    return HealthResponse(service="agrodoc-api", version=settings.version)
