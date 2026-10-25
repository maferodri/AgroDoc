"""Casos de uso del módulo crops: fincas, cultivos e historial.

Reglas del slice:
- Solo este módulo lee y escribe `farms`, `crops`, `crop_types` y `crop_events`.
- Cuando otro módulo necesita validar que un cultivo pertenece a un usuario,
  llama a una función pública de este archivo (no a su repositorio).
"""

from app.shared.schemas import ModuleHealth

MODULE = "crops"


def health() -> ModuleHealth:
    return ModuleHealth(module=MODULE)
