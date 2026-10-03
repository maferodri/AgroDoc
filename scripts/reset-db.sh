#!/usr/bin/env bash
# Borra el volumen de Postgres y vuelve a crear las bases desde cero.
# Útil cuando cambias infra/postgres/init-databases.sh (solo corre con el volumen vacío).
# Uso: ./scripts/reset-db.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

echo "⚠  Esto BORRA todos los datos de Postgres (volumen pgdata) y recrea las bases."
read -r -p "Escribe 'si' para continuar: " resp
if [ "$resp" != "si" ]; then
  echo "Cancelado."
  exit 0
fi

"${COMPOSE[@]}" down -v
"${COMPOSE[@]}" up -d --build

echo
echo "Listo. Comprueba con: ./scripts/status.sh"
