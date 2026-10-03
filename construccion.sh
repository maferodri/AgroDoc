#!/usr/bin/env bash
set -e

# Debe correrse desde la raíz de AgroDoc
[ -d Backend ] && [ -d Frontend ] || { echo "Ejecuta esto desde ~/Proyectos/AgroDoc"; exit 1; }

SERVICES=(gateway auth crops detection diagnosis consultations)

# ---------- Servicios FastAPI ----------
for s in "${SERVICES[@]}"; do
  d=Backend/services/$s
  mkdir -p $d/{app/{api/routes,core,db,schemas,services,clients},alembic,tests}

  touch $d/app/__init__.py \
        $d/app/api/__init__.py \
        $d/app/api/routes/__init__.py \
        $d/app/core/__init__.py \
        $d/app/db/__init__.py \
        $d/app/schemas/__init__.py \
        $d/app/services/__init__.py \
        $d/app/clients/__init__.py

  cat > $d/app/main.py <<EOF
from fastapi import FastAPI

app = FastAPI(title="$s service")


@app.get("/health")
def health():
    return {"service": "$s", "status": "ok"}
EOF

  printf "fastapi\nuvicorn[standard]\npydantic-settings\n" > $d/requirements.txt

  cat > $d/Dockerfile <<'EOF'
FROM python:3.12-slim

WORKDIR /code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
done

# ---------- Código compartido del backend ----------
mkdir -p Backend/common

# ---------- Frontend React ----------
mkdir -p Frontend/src/{api,components,hooks,pages,features/{auth,crops,detection,consultations}}

cat > Frontend/Dockerfile <<'EOF'
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
EOF

# ---------- ML, infra, docs ----------
mkdir -p ml/{notebooks,training,datasets,export}
mkdir -p infra/nginx docs
touch infra/docker-compose.yml infra/docker-compose.dev.yml

cat > .env.example <<'EOF'
POSTGRES_USER=agrodoc
POSTGRES_PASSWORD=cambiame
EOF

cat > .gitignore <<'EOF'
.env
__pycache__/
*.pyc
node_modules/
dist/
ml/datasets/
*.onnx
*.pt
EOF

echo "Estructura lista en $(pwd)"
