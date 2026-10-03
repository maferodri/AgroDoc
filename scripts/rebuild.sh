#!/usr/bin/env bash
# Reconstruye y reinicia uno o varios servicios. Úsalo cuando cambies
# requirements.txt (Python), package.json (frontend) o un Dockerfile.
# Uso: ./scripts/rebuild.sh <servicio> [servicio ...]
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

if [ $# -lt 1 ]; then
  echo "Uso: ./scripts/rebuild.sh <servicio> [servicio ...]"
  echo "Servicios: ${SERVICES[*]} web postgres"
  exit 1
fi

"${COMPOSE[@]}" up -d --build --no-deps "$@"
