"""diagnosis: seed de plagas y tratamientos desde ml/export/clases.json

Puebla `pests` con las 9 clases de plagas/enfermedades (las 3 clases `*_sana`
se excluyen: son estado sano, no una plaga) y añade su mapeo en `pest_crops`
y una recomendación de tratamiento por plaga con dosis y prioridad.

Revision ID: b7a6c5d4e3f2
Revises: c3d2e1f0a9b8
Create Date: 2026-11-17 10:05:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b7a6c5d4e3f2'
down_revision: str | None = 'c3d2e1f0a9b8'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


PESTS = [
    {
        'id': 1,
        'code': 'cafe_cercospora',
        'model_label': 'cafe_cercospora',
        'common_name': 'Cercospora (Mancha de hierro) del café',
        'category': 'Enfermedad (hongo)',
        'symptoms': 'Manchas circulares oscuras con borde rojizo en las hojas.',
    },
    {
        'id': 2,
        'code': 'cafe_minador',
        'model_label': 'cafe_minador',
        'common_name': 'Minador de la hoja del café',
        'category': 'Insecto',
        'symptoms': 'Galerías serpenteantes y manchas plateadas; caída de hojas.',
    },
    {
        'id': 3,
        'code': 'cafe_phoma',
        'model_label': 'cafe_phoma',
        'common_name': 'Phoma del café',
        'category': 'Enfermedad (hongo)',
        'symptoms': 'Lesiones secas en hojas y tallos; muerte regresiva de ramas.',
    },
    {
        'id': 4,
        'code': 'cafe_roya',
        'model_label': 'cafe_roya',
        'common_name': 'Roya del café',
        'category': 'Enfermedad (hongo)',
        'symptoms': 'Manchas amarillas y polvo anaranjado en el envés; defoliación.',
    },
    {
        'id': 5,
        'code': 'frijol_mancha_angular',
        'model_label': 'frijol_mancha_angular',
        'common_name': 'Mancha angular del frijol',
        'category': 'Enfermedad (hongo)',
        'symptoms': 'Manchas angulares marrones delimitadas por las nervaduras.',
    },
    {
        'id': 6,
        'code': 'frijol_roya',
        'model_label': 'frijol_roya',
        'common_name': 'Roya del frijol',
        'category': 'Enfermedad (hongo)',
        'symptoms': 'Pústulas rojizas o anaranjadas en el envés de las hojas.',
    },
    {
        'id': 7,
        'code': 'maiz_cogollero',
        'model_label': 'maiz_cogollero',
        'common_name': 'Gusano cogollero del maíz',
        'category': 'Insecto',
        'symptoms': 'Perforaciones en el cogollo y excremento aserrinado.',
    },
    {
        'id': 8,
        'code': 'maiz_escarabajo',
        'model_label': 'maiz_escarabajo',
        'common_name': 'Escarabajo del maíz',
        'category': 'Insecto',
        'symptoms': 'Hojas rasgadas, raíces dañadas y adultos en los estigmas.',
    },
    {
        'id': 9,
        'code': 'maiz_saltamontes',
        'model_label': 'maiz_saltamontes',
        'common_name': 'Saltamontes del maíz',
        'category': 'Insecto',
        'symptoms': 'Defoliación en bordes de hojas y mordeduras en tallos.',
    },
]

PEST_CROPS = [
    {'pest_id': 1, 'crop_type_code': 'coffee'},
    {'pest_id': 2, 'crop_type_code': 'coffee'},
    {'pest_id': 3, 'crop_type_code': 'coffee'},
    {'pest_id': 4, 'crop_type_code': 'coffee'},
    {'pest_id': 5, 'crop_type_code': 'bean'},
    {'pest_id': 6, 'crop_type_code': 'bean'},
    {'pest_id': 7, 'crop_type_code': 'maize'},
    {'pest_id': 8, 'crop_type_code': 'maize'},
    {'pest_id': 9, 'crop_type_code': 'maize'},
]

# `description` queda vacía: la recomendación en lenguaje sencillo vive en
# `recommendation`; `title` es la etiqueta corta del tratamiento.
TREATMENTS = [
    {
        'pest_id': 1,
        'treatment_type': 'Cultural',
        'title': 'Poda para ventilación',
        'recommendation': 'Pode las ramas bajas y elimine las hojas caídas para reducir la humedad.',
        'dose': None,
        'priority': 'alta',
    },
    {
        'pest_id': 1,
        'treatment_type': 'Químico',
        'title': 'Fungicida sistémico',
        'recommendation': 'Aplique fungicida sistémico registrado al aparecer las primeras manchas.',
        'dose': 'Según etiqueta del producto',
        'priority': 'media',
    },
    {
        'pest_id': 2,
        'treatment_type': 'Biológico',
        'title': 'Liberación de parasitoides',
        'recommendation': 'Libere avispas parasitoides que controlan las larvas del minador.',
        'dose': None,
        'priority': 'alta',
    },
    {
        'pest_id': 2,
        'treatment_type': 'Químico',
        'title': 'Insecticida selectivo',
        'recommendation': 'Aplique insecticida selectivo solo si hay más del 30% de hojas minadas.',
        'dose': 'Según etiqueta del producto',
        'priority': 'media',
    },
    {
        'pest_id': 3,
        'treatment_type': 'Cultural',
        'title': 'Poda sanitaria',
        'recommendation': 'Pode y retire las ramas secas para detener el avance del hongo.',
        'dose': None,
        'priority': 'alta',
    },
    {
        'pest_id': 3,
        'treatment_type': 'Químico',
        'title': 'Fungicida a base de cobre',
        'recommendation': 'Proteja los cortes de poda con fungicida a base de cobre.',
        'dose': '2 g por litro de agua',
        'priority': 'media',
    },
    {
        'pest_id': 4,
        'treatment_type': 'Cultural',
        'title': 'Control cultural',
        'recommendation': 'Retire y recoja las hojas con polvo anaranjado y mejore la aireación del cafetal.',
        'dose': None,
        'priority': 'alta',
    },
    {
        'pest_id': 4,
        'treatment_type': 'Químico',
        'title': 'Fungicida cúprico',
        'recommendation': 'Aplique fungicida cúprico preventivo en el envés al inicio de las lluvias.',
        'dose': '2 g por litro de agua, cada 15 días',
        'priority': 'media',
    },
    {
        'pest_id': 5,
        'treatment_type': 'Cultural',
        'title': 'Semilla sana y rotación',
        'recommendation': 'Use semilla libre de la enfermedad y rote con cultivos que no sean frijol.',
        'dose': None,
        'priority': 'alta',
    },
    {
        'pest_id': 5,
        'treatment_type': 'Químico',
        'title': 'Fungicida foliar',
        'recommendation': 'Aplique fungicida foliar al aparecer las primeras manchas.',
        'dose': 'Según etiqueta del producto',
        'priority': 'media',
    },
    {
        'pest_id': 6,
        'treatment_type': 'Cultural',
        'title': 'Variedades tolerantes y riego',
        'recommendation': 'Use variedades tolerantes y evite el exceso de riego por aspersión.',
        'dose': None,
        'priority': 'alta',
    },
    {
        'pest_id': 6,
        'treatment_type': 'Químico',
        'title': 'Fungicida',
        'recommendation': 'Aplique fungicida al detectar las primeras pústulas.',
        'dose': 'Según etiqueta del producto',
        'priority': 'media',
    },
    {
        'pest_id': 7,
        'treatment_type': 'Biológico',
        'title': 'Bacillus thuringiensis (Bt)',
        'recommendation': 'Aplique Bt en el cogollo en las primeras horas de la mañana.',
        'dose': '1-2 kg/ha según formulación',
        'priority': 'alta',
    },
    {
        'pest_id': 7,
        'treatment_type': 'Químico',
        'title': 'Insecticida',
        'recommendation': 'Use insecticida solo si más del 20% de las plantas están dañadas.',
        'dose': 'Según etiqueta del producto',
        'priority': 'media',
    },
    {
        'pest_id': 8,
        'treatment_type': 'Cultural',
        'title': 'Rotación de cultivos',
        'recommendation': 'Rote el maíz con cultivos no hospedantes para cortar el ciclo.',
        'dose': None,
        'priority': 'alta',
    },
    {
        'pest_id': 8,
        'treatment_type': 'Químico',
        'title': 'Insecticida al suelo',
        'recommendation': 'Aplique insecticida granulado al suelo al momento de la siembra.',
        'dose': 'Según etiqueta del producto',
        'priority': 'media',
    },
    {
        'pest_id': 9,
        'treatment_type': 'Cultural',
        'title': 'Control de malezas',
        'recommendation': 'Elimine las malezas de los bordes donde se refugian las ninfas.',
        'dose': None,
        'priority': 'alta',
    },
    {
        'pest_id': 9,
        'treatment_type': 'Químico',
        'title': 'Insecticida en franjas',
        'recommendation': 'Aplique insecticida en franjas perimetrales cuando haya brotes.',
        'dose': 'Según etiqueta del producto',
        'priority': 'media',
    },
]

pests_table = sa.table(
    'pests',
    sa.column('id', sa.SmallInteger),
    sa.column('code', sa.String),
    sa.column('model_label', sa.String),
    sa.column('common_name', sa.String),
    sa.column('category', sa.String),
    sa.column('symptoms', sa.Text),
)

pest_crops_table = sa.table(
    'pest_crops',
    sa.column('pest_id', sa.SmallInteger),
    sa.column('crop_type_code', sa.String),
)

treatments_table = sa.table(
    'treatments',
    sa.column('pest_id', sa.SmallInteger),
    sa.column('treatment_type', sa.String),
    sa.column('title', sa.String),
    sa.column('recommendation', sa.Text),
    sa.column('dose', sa.Text),
    sa.column('priority', sa.String),
)


def upgrade() -> None:
    op.bulk_insert(pests_table, PESTS)
    # Los ids son explícitos: hay que avanzar la secuencia para que el próximo
    # INSERT de la app no colisione con el id 1.
    op.execute("SELECT setval(pg_get_serial_sequence('pests', 'id'), (SELECT MAX(id) FROM pests));")
    op.bulk_insert(pest_crops_table, PEST_CROPS)
    op.bulk_insert(treatments_table, TREATMENTS)


def downgrade() -> None:
    op.execute('DELETE FROM treatments WHERE pest_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9);')
    op.execute('DELETE FROM pest_crops WHERE pest_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9);')
    op.execute('DELETE FROM pests WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9);')
