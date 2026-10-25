#!/usr/bin/env bash
# Muestra los contenedores y comprueba la salud del API, de cada módulo y del frontend.
# Uso: ./scripts/status.sh
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

"${COMPOSE[@]}" ps
echo

fail=0

check() {
  local label="$1" url="$2"
  if curl -fs --max-time 3 "$url" >/dev/null; then
    echo "✔ ${label}"
  else
    echo "✘ ${label} no responde (${url})"
    fail=1
  fi
}

check "api (/:${API_PORT}/health)" "http://localhost:${API_PORT}/health"
for module in "${API_MODULES[@]}"; do
  check "  └─ ${module}" "http://localhost:${API_PORT}/api/v1/${module}/health"
done
check "web (/:${WEB_PORT})" "http://localhost:${WEB_PORT}"

exit $fail
