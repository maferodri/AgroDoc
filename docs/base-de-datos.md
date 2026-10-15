# Base de datos de AgroDoc

Documento de diseño de Postgres: qué bases existen, qué tablas tiene cada una, **qué servicio es dueño de cada tabla** y cómo se relacionan entre sí.

Los esquemas SQL están en [`infra/postgres/schema/`](../infra/postgres/schema/) (uno por base de datos) y se aplican con `./scripts/schema.sh`.

## 1. ¿Una base o varias?

**Decisión: un servidor Postgres con una base de datos por servicio** (`auth_db`, `crops_db`, `diagnosis_db`, `consultations_db`). Es lo que ya crea `infra/postgres/init-databases.sh`.

| | Una base por servicio (elegida) | Una sola base compartida |
|---|---|---|
| Independencia | Cada servicio cambia su esquema sin afectar a los demás | Un cambio de tabla puede romper a otro servicio |
| Acoplamiento | Obliga a comunicarse por API | Tentación de hacer `JOIN` entre servicios (monolito disfrazado) |
| Integridad | Sin `FOREIGN KEY` entre servicios; se valida por API | `FOREIGN KEY` en todo |
| Complejidad | Algo más de trabajo al cruzar datos | Más simple de consultar |

`detection` y `gateway` **no tienen base de datos**: `detection` solo hace inferencia y `gateway` solo enruta.

> Si el equipo prefiere simplificar, existe un término medio: una sola base con un *schema* por servicio y un usuario de Postgres por servicio con permiso solo sobre su schema. Para el alcance de la clase, lo ya montado (una base por servicio) cumple mejor la idea de microservicios.

## 2. Reglas

1. **Cada tabla tiene un solo servicio dueño.** Solo ese servicio la lee y escribe directamente.
2. **Prohibido consultar la base de otro servicio.** Si `diagnosis` necesita saber si un cultivo es del usuario, se lo pregunta a `crops` por HTTP.
3. **Referencias entre servicios = columnas `uuid` sin `FOREIGN KEY`** (en los `.sql` están marcadas como `ref lógica`). Por ejemplo, `crops.owner_id` guarda un `users.id`, pero Postgres no lo verifica.
4. **IDs `uuid`** generados por la base (`gen_random_uuid()`), así se pueden compartir entre servicios sin colisiones. Los catálogos pequeños usan `smallserial` más un `code` estable.
5. **Fechas en `timestamptz`** y `updated_at` automático mediante trigger.
6. **No se borran usuarios**: se desactivan (`users.is_active = false`), porque otros servicios guardan su `id`.

## 3. Vista general: qué servicio usa qué base

```mermaid
flowchart LR
    subgraph Servicios
        gw[gateway]
        auth[auth]
        crops[crops]
        det[detection]
        diag[diagnosis]
        cons[consultations]
    end

    gw -. sin BD .- gw
    det -. sin BD .- det

    auth ==> adb[(auth_db)]
    crops ==> cdb[(crops_db)]
    diag ==> ddb[(diagnosis_db)]
    cons ==> kdb[(consultations_db)]

    model[/ml/export/model.onnx/] -.-> det
```

Las flechas gruesas son acceso directo (lectura y escritura). Todo lo demás pasa por API.

## 4. Referencias lógicas entre bases

Cada flecha punteada es una columna `uuid` que apunta a otra base **sin** `FOREIGN KEY`:

```mermaid
flowchart LR
    subgraph auth_db
        users
    end
    subgraph crops_db
        farms
        crops
        crop_types
    end
    subgraph diagnosis_db
        diagnoses
        pest_crops
    end
    subgraph consultations_db
        consultations
        consultation_messages
    end

    farms -. owner_id .-> users
    crops -. owner_id .-> users
    diagnoses -. user_id .-> users
    diagnoses -. "crop_id" .-> crops
    diagnoses -. "crop_type_code" .-> crop_types
    pest_crops -. "crop_type_code" .-> crop_types
    diagnoses -. consultation_id .-> consultations
    consultations -. diagnosis_id .-> diagnoses
    consultations -. "requester_id / agronomist_id" .-> users
    consultations -. crop_id .-> crops
    consultation_messages -. author_id .-> users
```

## 5. Diagramas por base de datos

### auth_db (servicio `auth`)

```mermaid
erDiagram
    users ||--o| agronomist_profiles : "perfil"
    users ||--o{ refresh_tokens : "sesiones"

    users {
        uuid id PK
        text email UK
        text password_hash
        text full_name
        text role "farmer | agronomist | admin"
        boolean is_active
    }
    agronomist_profiles {
        uuid user_id PK, FK
        text specialty
        text license_number
        boolean is_available
    }
    refresh_tokens {
        uuid id PK
        uuid user_id FK
        text token_hash UK
        timestamptz expires_at
        timestamptz revoked_at
    }
```

### crops_db (servicio `crops`)

```mermaid
erDiagram
    crop_types ||--o{ crops : "tipo"
    farms |o--o{ crops : "ubicado en"
    crops ||--o{ crop_events : "historial"

    crop_types {
        smallint id PK
        text code UK "maize | coffee | beans"
        text name_es
        text scientific_name
    }
    farms {
        uuid id PK
        uuid owner_id "ref lógica a users"
        text name
        text department
        text municipality
        numeric area_hectares
    }
    crops {
        uuid id PK
        uuid owner_id "ref lógica a users"
        uuid farm_id FK
        smallint crop_type_id FK
        text name
        date planted_on
        text growth_stage
        text status "active | harvested | discarded"
    }
    crop_events {
        uuid id PK
        uuid crop_id FK
        text event_type
        text description
        timestamptz occurred_at
    }
```

### diagnosis_db (servicio `diagnosis`)

```mermaid
erDiagram
    pests ||--o{ pest_crops : "afecta a"
    pests ||--o{ treatments : "se trata con"
    pests |o--o{ diagnoses : "resultado"

    pests {
        smallint id PK
        text code UK
        text model_label UK "clase que devuelve el modelo"
        text common_name
        text category
        text symptoms
    }
    pest_crops {
        smallint pest_id PK, FK
        text crop_type_code PK "ref lógica a crop_types"
    }
    treatments {
        uuid id PK
        smallint pest_id FK
        text treatment_type
        text title
        text description
    }
    diagnoses {
        uuid id PK
        uuid user_id "ref lógica a users"
        uuid crop_id "ref lógica a crops"
        text image_path
        text model_version
        text predicted_label
        smallint pest_id FK
        numeric confidence
        numeric threshold_used
        boolean low_confidence "calculada"
        jsonb top_k
        uuid consultation_id "ref lógica"
    }
```

### consultations_db (servicio `consultations`)

```mermaid
erDiagram
    consultations ||--o{ consultation_messages : "conversación"

    consultations {
        uuid id PK
        uuid diagnosis_id UK "ref lógica a diagnoses"
        uuid requester_id "ref lógica a users"
        uuid agronomist_id "ref lógica a users"
        text status "open | assigned | answered | closed | cancelled"
        text image_path "copia del diagnóstico"
        text model_label "copia del diagnóstico"
        numeric model_confidence "copia del diagnóstico"
        text verified_label "respuesta del agrónomo"
        boolean model_was_correct
    }
    consultation_messages {
        uuid id PK
        uuid consultation_id FK
        uuid author_id "ref lógica a users"
        text author_role "farmer | agronomist"
        text body
    }
```

## 6. Quién usa cada tabla

**Dueño** = único servicio que la lee y escribe en la base. **Consumidores** = servicios que necesitan sus datos y los obtienen **por API** del dueño.

| Base | Tabla | Dueño | Consumidores (vía API) | Para qué |
|---|---|---|---|---|
| `auth_db` | `users` | `auth` | `gateway` (validar sesión), `consultations` (nombre del agrónomo) | Cuentas y roles |
| `auth_db` | `agronomist_profiles` | `auth` | `consultations` (elegir agrónomo disponible) | Datos del agrónomo |
| `auth_db` | `refresh_tokens` | `auth` | — | Renovar sesión |
| `crops_db` | `crop_types` | `crops` | `diagnosis`, `web` | Catálogo: maíz, café, frijol |
| `crops_db` | `farms` | `crops` | `web` | Fincas del usuario |
| `crops_db` | `crops` | `crops` | `diagnosis` (verificar que el cultivo es del usuario), `consultations` (contexto del caso), `web` | Cultivos guardados |
| `crops_db` | `crop_events` | `crops` | `web` | Bitácora del cultivo |
| `diagnosis_db` | `pests` | `diagnosis` | `consultations`, `web` | Catálogo de plagas |
| `diagnosis_db` | `pest_crops` | `diagnosis` | `web` | Qué plaga afecta a qué cultivo |
| `diagnosis_db` | `treatments` | `diagnosis` | `web` | Recomendaciones por plaga |
| `diagnosis_db` | `diagnoses` | `diagnosis` | `crops` (historial de un cultivo), `consultations` (detalle del caso), `web` | Resultado de cada imagen analizada |
| `consultations_db` | `consultations` | `consultations` | `diagnosis` (estado del caso), `web` | Casos escalados a agrónomos |
| `consultations_db` | `consultation_messages` | `consultations` | `web` | Conversación agricultor ↔ agrónomo |
| *(sin BD)* | — | `detection`, `gateway` | — | Inferencia y enrutado |

## 7. Qué tablas se tocan en cada paso

Flujo de un diagnóstico con baja confianza:

```mermaid
sequenceDiagram
    actor U as Agricultor
    participant W as Web
    participant G as Gateway
    participant A as auth
    participant C as crops
    participant D as diagnosis
    participant M as detection
    participant K as consultations
    actor AG as Agrónomo

    U->>W: Sube foto de su cultivo
    W->>G: POST /diagnoses (foto + crop_id)
    G->>A: Validar token
    Note right of A: auth_db: lee users
    G->>D: Crear diagnóstico
    D->>C: ¿El cultivo es de este usuario?
    Note right of C: crops_db: lee crops
    D->>M: Imagen → etiqueta + confianza
    Note right of M: sin base de datos (usa el modelo ONNX)
    Note right of D: diagnosis_db: lee pests, treatments<br/>escribe diagnoses
    alt confianza menor al umbral
        D->>K: Crear consulta (copia imagen y resultado)
        Note right of K: consultations_db: escribe consultations
        Note right of D: diagnosis_db: actualiza diagnoses.consultation_id
    end
    D-->>G: Resultado
    G-->>W: Diagnóstico y recomendaciones
    AG->>K: Responde el caso
    Note right of K: consultations_db: escribe consultation_messages<br/>actualiza consultations (verified_label, status)
```

## 8. Detalles de diseño

* **`diagnoses.low_confidence` es una columna calculada** (`confidence < threshold_used`), así nunca se contradice con la confianza guardada. El umbral se configura en el servicio `diagnosis` (variable de entorno) y se guarda en cada fila para saber con cuál se decidió.
* **`diagnoses.top_k`** guarda las mejores predicciones alternativas del modelo en JSON: `[{"label": "...", "confidence": 0.12}]`.
* **`consultations` guarda una copia** de la imagen, la etiqueta y la confianza del modelo. Así el agrónomo ve el caso completo sin que `consultations` dependa de `diagnosis` en cada lectura.
* **Reentrenamiento:** cuando el agrónomo responde, `verified_label` y `model_was_correct` quedan como etiqueta verificada por un experto. Es una fuente de datos reales de la región para el fine-tuning del modelo.
* **`pests.model_label`** es la clase exacta que devuelve el modelo. Tiene que coincidir con la lista de clases del entrenamiento (`ml/`); si se agregan o renombran clases, hay que actualizar el catálogo.
* **`crop_types.code`** (`maize`, `coffee`, `beans`) es la clave estable que usan los demás servicios en vez del `id` numérico.

## 9. Pendientes y decisiones abiertas

- [ ] **Almacenamiento de imágenes:** las tablas guardan `image_path`, pero aún no hay dónde se guardan los archivos (un volumen de Docker compartido, MinIO/S3, etc.). Hay que decidirlo y agregarlo al compose.
- [ ] **Datos iniciales (seed):** `crop_types` ya viene con maíz, café y frijol; `pests`, `pest_crops` y `treatments` están vacías y deben llenarse con las plagas del modelo y sus tratamientos, idealmente revisados por un agrónomo.
- [ ] **Alembic:** estos `.sql` son el diseño de referencia. Cuando el equipo de backend cree los modelos SQLAlchemy, las migraciones de Alembic pasan a ser la fuente de verdad. Mientras tanto, `./scripts/schema.sh` sirve para probar.
- [ ] **URLs entre servicios en el compose:** en el diagrama del punto 7, `diagnosis` llama a `crops` y a `consultations`, pero en `infra/docker-compose.yml` solo tiene `DETECTION_URL`. Hay que agregarle `CROPS_URL` y `CONSULTATIONS_URL`.
- [ ] **Umbral de confianza:** definir el valor inicial (por ejemplo 0.70) y dónde se configura.

## 10. Cómo aplicar y revisar los esquemas

Con el entorno levantado (`./scripts/dev.sh`):

```bash
./scripts/schema.sh                # aplica los cuatro esquemas
./scripts/schema.sh crops          # solo uno
```

Los scripts son idempotentes: se pueden correr varias veces. Para ver las tablas de una base:

```bash
docker compose -f infra/docker-compose.yml --env-file .env exec postgres \
  psql -U agrodoc -d crops_db -c '\dt'
```

(cambia `agrodoc` por el valor de `POSTGRES_USER` en tu `.env`, y `crops_db` por la base que quieras ver).

Para empezar de cero con las bases vacías: `./scripts/reset-db.sh`.
