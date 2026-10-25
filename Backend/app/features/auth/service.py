"""Casos de uso del módulo auth: registro, login, sesiones y roles.

Reglas del slice:
- Solo este módulo lee y escribe las tablas de usuarios, perfiles y sesiones.
- Otros módulos obtienen datos de usuario llamando a funciones de este archivo,
  nunca importando sus modelos ni consultando sus tablas.
"""

from app.shared.schemas import ModuleHealth

MODULE = "auth"


def health() -> ModuleHealth:
    return ModuleHealth(module=MODULE)
