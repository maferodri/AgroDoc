"""Fixtures compartidas por la suite.

Los tests de `auth` no necesitan Postgres: la única capa que toca SQL es
`repository`, y su contrato se sustituye con `monkeypatch`. La sesión que se
inyecta (`FakeSession`) solo registra `commit()`/`rollback()`, que es lo único
que el `service` hace con ella.
"""

import uuid
from datetime import UTC, datetime
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.core.security import hash_password
from app.features.auth.models import User
from app.main import app


class FakeSession:
    """Sesión de SQLAlchemy falsa: cuenta las transacciones cerradas."""

    def __init__(self) -> None:
        self.commits = 0
        self.rollbacks = 0

    def commit(self) -> None:
        self.commits += 1

    def rollback(self) -> None:
        self.rollbacks += 1


@pytest.fixture
def fake_db() -> FakeSession:
    return FakeSession()


@pytest.fixture
def client(fake_db: FakeSession):
    app.dependency_overrides[get_db] = lambda: fake_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def make_user():
    """Fábrica de usuarios ORM sin base de datos."""

    def _make_user(
        *,
        email: str = "farmer@example.com",
        password: str = "Secreta123",
        full_name: str = "Agricultor Demo",
        role: str = "farmer",
        is_active: bool = True,
        user_id: uuid.UUID | None = None,
        **extra: Any,
    ) -> User:
        now = datetime.now(UTC)
        return User(
            id=user_id or uuid.uuid4(),
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            role=role,
            is_active=is_active,
            created_at=now,
            updated_at=now,
            **extra,
        )

    return _make_user
