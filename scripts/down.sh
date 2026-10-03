#!/usr/bin/env bash
# Detiene y elimina los contenedores. Los datos de Postgres se conservan.
# Uso: ./scripts/down.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

"${COMPOSE[@]}" down "$@"
