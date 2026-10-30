
"""Incrusta en el ONNX los metadatos que consume `detection.service`.

Lee las clases desde `ml/export/clases.json`, valida que coincidan con la
dimensión de salida del modelo y guarda el resultado en el mismo ONNX (o en
la ruta indicada con --output).

Uso:
    python ml/training/annotate_onnx.py
    python ml/training/annotate_onnx.py --model ml/export/model.onnx \
        --labels ml/export/clases.json --output ml/export/model.onnx

Requiere el paquete `onnx` en el entorno de entrenamiento.
No hace falta instalarlo en el backend: allí solo se usa `onnxruntime`.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import onnx

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MODEL_PATH = REPO_ROOT / "ml" / "export" / "model.onnx"
DEFAULT_LABELS_PATH = REPO_ROOT / "ml" / "export" / "clases.json"

INPUT_SIZE = (224, 224)
MEAN = (0.485, 0.456, 0.406)
STD = (0.229, 0.224, 0.225)

# "resize"       -> Resize directo a INPUT_SIZE
# "center_crop"  -> Resize del lado corto a RESIZE_SIZE + CenterCrop a INPUT_SIZE
RESIZE_MODE = "resize"
RESIZE_SIZE = 256

OUTPUT_TYPE = "logits"
MODEL_VERSION = "v1.0.0"


def _load_labels(path: Path) -> list[str]:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SystemExit(f"No existe el archivo de clases: {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"El archivo {path} no es JSON válido: {exc}") from exc

    if not isinstance(raw, list) or not all(isinstance(item, str) for item in raw):
        raise SystemExit(f"{path} debe ser una lista JSON de strings.")
    if not raw:
        raise SystemExit(f"{path} está vacío.")
    if any(not label.strip() for label in raw):
        raise SystemExit(f"{path} contiene etiquetas vacías.")
    if len(set(raw)) != len(raw):
        raise SystemExit(f"{path} contiene etiquetas duplicadas.")

    return raw


def _output_classes(model: onnx.ModelProto) -> int:
    if not model.graph.output:
        raise SystemExit("El ONNX no declara ninguna salida.")

    shape = model.graph.output[0].type.tensor_type.shape
    if not shape.dim:
        raise SystemExit("La salida del ONNX no tiene dimensiones declaradas.")

    num_classes = shape.dim[-1].dim_value
    if num_classes <= 0:
        raise SystemExit(
            "La dimensión de clases de la salida es dinámica o desconocida; "
            "no se puede validar contra clases.json."
        )

    return num_classes


def _set_metadata(model: onnx.ModelProto, metadata: dict[str, str]) -> None:
    existing = {prop.key: prop for prop in model.metadata_props}

    for key, value in metadata.items():
        if key in existing:
            existing[key].value = value
        else:
            prop = model.metadata_props.add()
            prop.key = key
            prop.value = value


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL_PATH)
    parser.add_argument("--labels", type=Path, default=DEFAULT_LABELS_PATH)
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--version", default=MODEL_VERSION)
    args = parser.parse_args()

    labels = _load_labels(args.labels)
    model = onnx.load(args.model)
    num_classes = _output_classes(model)

    if num_classes != len(labels):
        raise SystemExit(
            f"El modelo devuelve {num_classes} clases, pero {args.labels} "
            f"tiene {len(labels)} etiquetas."
        )

    metadata = {
        "labels": json.dumps(labels, ensure_ascii=False),
        "input_size": json.dumps(list(INPUT_SIZE)),
        "mean": json.dumps(list(MEAN)),
        "std": json.dumps(list(STD)),
        "resize_mode": RESIZE_MODE,
        "resize_size": str(RESIZE_SIZE),
        "output_type": OUTPUT_TYPE,
        "version": args.version,
    }

    _set_metadata(model, metadata)
    onnx.checker.check_model(model)

    output = args.output or args.model
    output.parent.mkdir(parents=True, exist_ok=True)
    onnx.save(model, output)

    print(f"Modelo:  {args.model}")
    print(f"Clases:  {num_classes} ({args.labels})")
    print(f"Salida:  {output}")
    print(f"Versión: {args.version}")


if __name__ == "__main__":
    main()
