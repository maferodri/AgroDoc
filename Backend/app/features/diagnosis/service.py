"""Casos de uso del módulo diagnosis.

Orquesta el flujo: valida el cultivo con `crops.service`, pide la inferencia a
`detection.service`, guarda el diagnóstico y, si la confianza es baja, delega
la escalación a `consultations.service` (todo en proceso).

Reglas del slice:
- Solo este módulo lee y escribe `diagnoses`, `pests`, `pest_crops` y
  `treatments`.
- No importa modelos de otros módulos: usa sus funciones de servicio.
"""

from app.shared.schemas import ModuleHealth

MODULE = "diagnosis"


def health() -> ModuleHealth:
    return ModuleHealth(module=MODULE)
