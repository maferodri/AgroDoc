#!/usr/bin/env bash
# Borra el volumen de Postgres y vuelve a crear la base de datos desde cero.
# Uso: ./scripts/reset-db.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

echo "⚠  Esto BORRA todos los datos de Postgres (volumen pgdata) y recrea la base."
read -r -p "Escribe 'si' para continuar: " resp
if [ "$resp" != "si" ]; then
  echo "Cancelado."
  exit 0
fi

"${COMPOSE[@]}" down -v
"${COMPOSE[@]}" up -d --build

echo
echo "Listo. Aplica las migraciones con: ./scripts/migrate.sh"
echo "Comprueba el estado con: ./scripts/status.sh"
