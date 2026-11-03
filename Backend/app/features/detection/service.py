
"""Inferencia de plagas a partir de una imagen.

Este módulo no tiene base de datos: carga el ONNX indicado por `MODEL_PATH`
de forma perezosa, lee la configuración de sus metadatos y devuelve etiqueta,
confianza y top_k. El umbral de confianza lo aplica `diagnosis`.
"""

import io
import json
from functools import lru_cache

import numpy as np
from PIL import Image

from app.core.config import settings
from app.core.exceptions import DomainError
from app.features.detection.schemas import Prediction, TopKPrediction
from app.shared.schemas import ModuleHealth

MODULE = "detection"

_REQUIRED_METADATA = ("labels", "input_size", "mean", "std")


class DetectionUnavailableError(DomainError):
    """El modelo no está disponible o sus metadatos son inválidos."""

    status_code = 503
    code = "detection_unavailable"


def health() -> ModuleHealth:
    return ModuleHealth(module=MODULE)


@lru_cache(maxsize=1)
def _session():
    try:
        import onnxruntime as ort
    except ImportError as exc:
        raise DetectionUnavailableError(
            "onnxruntime no está instalado en el backend."
        ) from exc

    try:
        return ort.InferenceSession(
            settings.model_path,
            providers=["CPUExecutionProvider"],
        )
    except Exception as exc:
        raise DetectionUnavailableError(
            f"No se pudo cargar el modelo ONNX en {settings.model_path}."
        ) from exc


@lru_cache(maxsize=1)
def _metadata() -> dict[str, str]:
    return _session().get_modelmeta().custom_metadata_map


@lru_cache(maxsize=1)
def _config() -> dict:
    metadata = _metadata()
    missing = [key for key in _REQUIRED_METADATA if key not in metadata]
    if missing:
        raise DetectionUnavailableError(
            "Faltan metadatos en el ONNX: " + ", ".join(missing)
        )

    labels = json.loads(metadata["labels"])
    input_size = tuple(int(value) for value in json.loads(metadata["input_size"]))
    mean = np.asarray(json.loads(metadata["mean"]), dtype=np.float32)
    std = np.asarray(json.loads(metadata["std"]), dtype=np.float32)

    if not labels:
        raise DetectionUnavailableError("La lista de etiquetas del modelo está vacía.")
    if len(input_size) != 2:
        raise DetectionUnavailableError(
            "`input_size` debe tener dos valores: [ancho, alto]."
        )
    if mean.shape != (3,) or std.shape != (3,):
        raise DetectionUnavailableError("`mean` y `std` deben tener tres valores RGB.")

    return {
        "labels": labels,
        "input_size": input_size,
        "mean": mean,
        "std": std,
        "output_type": metadata.get("output_type", "logits"),
        "resize_mode": metadata.get("resize_mode", "resize"),
        "resize_size": int(metadata.get("resize_size", max(input_size))),
        "version": metadata.get("version", "unknown"),
    }


def _resize_for_model(image: Image.Image, config: dict) -> Image.Image:
    input_size = config["input_size"]

    if config["resize_mode"] == "resize":
        return image.resize(input_size, Image.Resampling.BILINEAR)

    if config["resize_mode"] != "center_crop":
        raise DetectionUnavailableError(
            f"`resize_mode` no soportado: {config['resize_mode']}"
        )

    target_short = config["resize_size"]
    width, height = image.size
    scale = target_short / min(width, height)
    resized_size = (round(width * scale), round(height * scale))
    image = image.resize(resized_size, Image.Resampling.BILINEAR)

    left = (resized_size[0] - input_size[0]) // 2
    top = (resized_size[1] - input_size[1]) // 2
    return image.crop((left, top, left + input_size[0], top + input_size[1]))


def _preprocess(image_bytes: bytes) -> np.ndarray:
    config = _config()

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise DomainError("La imagen no es válida o está corrupta.") from exc

    image = _resize_for_model(image, config)
    array = np.asarray(image, dtype=np.float32) / 255.0
    array = (array - config["mean"]) / config["std"]
    array = np.transpose(array, (2, 0, 1))
    return np.expand_dims(array, axis=0)


def _softmax(values: np.ndarray) -> np.ndarray:
    shifted = values - np.max(values)
    exp = np.exp(shifted)
    return exp / np.sum(exp)


def predict(image_bytes: bytes, top_k: int = 5) -> Prediction:
    config = _config()
    labels = config["labels"]
    session = _session()
    input_name = session.get_inputs()[0].name

    output = session.run(None, {input_name: _preprocess(image_bytes)})[0]
    scores = np.asarray(output).reshape(-1)

    if config["output_type"] == "logits":
        scores = _softmax(scores)
    elif config["output_type"] != "probabilities":
        raise DetectionUnavailableError(
            f"`output_type` no soportado: {config['output_type']}"
        )

    if scores.size != len(labels):
        raise DetectionUnavailableError(
            f"El modelo devolvió {scores.size} clases y hay {len(labels)} etiquetas."
        )

    count = max(1, min(top_k, len(labels)))
    order = np.argsort(scores)[::-1][:count]
    top = [
        TopKPrediction(label=labels[index], confidence=float(scores[index]))
        for index in order
    ]

    return Prediction(
        label=top[0].label,
        confidence=top[0].confidence,
        top_k=top,
        model_version=config["version"],
    )
