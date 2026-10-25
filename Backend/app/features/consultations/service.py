"""Casos de uso del módulo consultations: casos y mensajes.

Reglas del slice:
- Solo este módulo lee y escribe `consultations` y `consultation_messages`.
- Guarda una copia de la imagen, etiqueta y confianza del diagnóstico para que
  el agrónomo vea el caso completo sin depender de `diagnosis` en cada lectura.
"""

from app.shared.schemas import ModuleHealth

MODULE = "consultations"


def health() -> ModuleHealth:
    return ModuleHealth(module=MODULE)
