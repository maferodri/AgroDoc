#!/usr/bin/env bash
# Levanta el entorno de desarrollo completo (construye las imágenes si hace falta).
# Uso: ./scripts/dev.sh              -> levanta todo
#      ./scripts/dev.sh api        -> levanta solo el API (y sus dependencias)
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

"${COMPOSE[@]}" up --build -d "$@"

echo
echo "Entorno levantado:"
echo "  Web ............ http://localhost:${WEB_PORT}"
echo "  API ............ http://localhost:${API_PORT}"
echo "  Swagger ........ http://localhost:${API_PORT}/docs"
echo "  Módulos ........ http://localhost:${API_PORT}/api/v1/<modulo>/health"
echo
echo "Comprobar estado: ./scripts/status.sh"
