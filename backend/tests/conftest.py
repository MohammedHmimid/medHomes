# Configure un environnement de test isole AVANT tout import de l'app,
# pour ne jamais toucher a la base de developpement.
import os

os.environ["DATABASE_URL"] = "sqlite:///./test_immoassist.db"
os.environ["SECRET_KEY"] = "test_secret_key_for_pytest_only"

import pytest  # noqa: E402
from app.db.database import Base, engine  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _prepare_test_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("test_immoassist.db"):
        os.remove("test_immoassist.db")
