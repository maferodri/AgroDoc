#!/usr/bin/env bash
# Sigue los logs en vivo (Ctrl+C para salir).
# Uso: ./scripts/logs.sh              -> todos los servicios
#      ./scripts/logs.sh auth         -> solo auth
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

"${COMPOSE[@]}" logs -f --tail=100 "$@"
