"""Esquemas de uso transversal. Los esquemas de negocio viven en cada slice."""

from pydantic import BaseModel


class ModuleHealth(BaseModel):
    module: str
    status: str = "ok"


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "agrodoc-api"
    version: str
