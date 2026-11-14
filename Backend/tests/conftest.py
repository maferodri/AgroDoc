import os

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://test_user:test_password@localhost:5432/test_db"
)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ejecuta las migraciones de Alembic al inicio de las pruebas."""
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)

    command.upgrade(alembic_cfg, "head")
    yield
    command.downgrade(alembic_cfg, "base")


@pytest.fixture(scope="function")
def db_session():
    """Aísla cada prueba en una transacción que realiza rollback al terminar."""
    engine = create_engine(TEST_DATABASE_URL)
    connection = engine.connect()
    transaction = connection.begin()

    TestingSessionLocal = sessionmaker(bind=connection, join_transaction_mode="create_savepoint")
    session = TestingSessionLocal()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Cliente de la app completa. Los tests de health no tocan la base."""
    with TestClient(app) as test_client:
        yield test_client
