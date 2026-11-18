-- Diagnóstico temporal de prueba (roya del café).
--
-- Requisito: aplicar las migraciones primero (crea el seed de pests/treatments):
--   ./scripts/migrate.sh
--
-- Ejecutar este archivo:
--   docker compose -f infra/docker-compose.yml --env-file .env exec -T postgres \
--     psql -U agrodoc -d agrodoc_db < scripts/test_diagnosis.sql
--
-- Luego probar el endpoint (sin token, modo temporal de pruebas):
--   curl http://localhost:8000/api/v1/diagnoses/<id_que_devuelve_el_insert>

INSERT INTO diagnoses
    (user_id, image_path, model_version, predicted_label, pest_id, confidence, threshold_used)
SELECT
    gen_random_uuid(),          -- user_id: da igual, el endpoint temporal no valida dueño
    '/tmp/prueba-cafe-roya.jpg',
    'v1.0.0',
    p.model_label,
    p.id,
    0.8734,                     -- confianza alta (> 0.70, low_confidence = false)
    0.70
FROM pests p
WHERE p.code = 'cafe_roya'
RETURNING id, predicted_label, pest_id, confidence;
