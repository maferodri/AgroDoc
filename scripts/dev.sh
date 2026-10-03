#!/usr/bin/env bash
# Levanta el entorno de desarrollo completo (construye las imágenes si hace falta).
# Uso: ./scripts/dev.sh              -> levanta todo
#      ./scripts/dev.sh auth crops   -> levanta solo esos servicios (y sus dependencias)
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

"${COMPOSE[@]}" up --build -d "$@"

echo
echo "Entorno levantado:"
echo "  Web ............ http://localhost:3000"
echo "  Gateway ........ http://localhost:8000"
echo "  Servicios ...... auth :8001 | crops :8002 | detection :8003 | diagnosis :8004 | consultations :8005"
echo
echo "Comprobar estado: ./scripts/status.sh"
