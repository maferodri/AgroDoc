#!/bin/bash
set -e
for db in auth crops diagnosis consultations; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
    -c "CREATE DATABASE ${db}_db;"
done
