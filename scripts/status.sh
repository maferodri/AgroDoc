#!/usr/bin/env bash
# Muestra los contenedores y comprueba el /health de cada servicio.
# Uso: ./scripts/status.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

"${COMPOSE[@]}" ps
echo

declare -A PORTS=(
  [gateway]=8000
  [auth]=8001
  [crops]=8002
  [detection]=8003
  [diagnosis]=8004
  [consultations]=8005
)

fail=0
for s in "${SERVICES[@]}"; do
  if curl -fs --max-time 3 "http://localhost:${PORTS[$s]}/health" >/dev/null; then
    echo "✔ $s (:${PORTS[$s]})"
  else
    echo "✘ $s (:${PORTS[$s]}) no responde"
    fail=1
  fi
done

if curl -fs --max-time 3 "http://localhost:3000" >/dev/null; then
  echo "✔ web (:3000)"
else
  echo "✘ web (:3000) no responde"
  fail=1
fi

exit $fail
