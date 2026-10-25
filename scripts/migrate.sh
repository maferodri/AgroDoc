#!/usr/bin/env bash
# Gestiona las migraciones de Alembic dentro del contenedor `api`.
# Uso: ./scripts/migrate.sh                    -> aplica todas (upgrade head)
#      ./scripts/migrate.sh -m "mensaje"       -> crea una revisión autogenerada
#      ./scripts/migrate.sh down -1            -> cualquier otro comando de Alembic
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

case "${1:-}" in
  "")
    "${COMPOSE[@]}" exec api alembic upgrade head
    ;;
  -m|--message)
    if [ $# -lt 2 ]; then
      echo "Falta el mensaje. Uso: ./scripts/migrate.sh -m \"crear tabla users\""
      exit 1
    fi
    "${COMPOSE[@]}" exec api alembic revision --autogenerate -m "$2"
    ;;
  *)
    "${COMPOSE[@]}" exec api alembic "$@"
    ;;
esac
