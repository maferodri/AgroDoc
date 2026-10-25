"""Monolito modular de AgroDoc.

La aplicación es un único proceso FastAPI. El código se organiza por
*features* (vertical slicing): cada carpeta de `app/features/` contiene sus
endpoints, su lógica, sus esquemas y, si aplica, sus modelos y acceso a datos.
"""
