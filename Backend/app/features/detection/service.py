"""Inferencia de plagas a partir de una imagen.

Este módulo no tiene base de datos: carga el modelo ONNX indicado por
`MODEL_PATH` y devuelve etiqueta + confianza. El umbral de confianza vive en
`settings.confidence_threshold` y lo aplica el módulo `diagnosis`.

Se importará `onnxruntime` de forma perezosa cuando se implemente la
inferencia, para que el monolito arranque aunque el modelo todavía no esté
disponible.
"""

from app.shared.schemas import ModuleHealth

MODULE = "detection"


def health() -> ModuleHealth:
    return ModuleHealth(module=MODULE)
