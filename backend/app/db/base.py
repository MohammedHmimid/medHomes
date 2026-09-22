# Ce module importe tous les modeles pour que Base.metadata les connaisse.
# Utilise par Alembic (autogenerate) et par la creation de tables au demarrage.
from app.db.database import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.property import Property, PropertyImage  # noqa: F401
from app.models.favorite import Favorite  # noqa: F401
from app.models.contact import ContactRequest  # noqa: F401
from app.models.notification import Notification  # noqa: F401
