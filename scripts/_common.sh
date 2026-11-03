#!/usr/bin/env bash
# Código compartido por los demás scripts. No se ejecuta directamente.
set -euo pipefail

# Siempre trabajamos desde la raíz del repo, sin importar dónde se llame el script
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no está instalado o no está en el PATH." >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "→ Se creó .env a partir de .env.example (cambia la contraseña si hace falta)."
fi

# Servicios del stack (monolito + base de datos + frontend)
SERVICES=(postgres api web)

# Slices verticales del monolito (se comprueban en /api/v1/<modulo>/health)
API_MODULES=(auth crops detection diagnoses consultations)

API_PORT=8000
WEB_PORT=3000

# Compose base + override de desarrollo (recarga en caliente y puerto abierto)
COMPOSE=(docker compose -f infra/docker-compose.yml -f infra/docker-compose.dev.yml --env-file .env)
