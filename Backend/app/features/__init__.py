"""Slices verticales del monolito.

Cada subcarpeta es un módulo autocontenido:

    features/<modulo>/
    ├── router.py      # capa HTTP (endpoints)
    ├── service.py     # casos de uso / reglas de negocio
    ├── schemas.py     # esquemas Pydantic de entrada y salida
    ├── models.py      # modelos SQLAlchemy (si el módulo tiene tablas)
    └── repository.py  # acceso a datos (si el módulo tiene tablas)
"""
