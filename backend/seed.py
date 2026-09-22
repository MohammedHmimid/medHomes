"""Script de peuplement de la base de donnees avec un compte admin et des
biens de demonstration. A executer une fois les dependances installees :

    python seed.py
"""
from app.db.database import SessionLocal, engine, Base
from app.db import base  # noqa: F401
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.property import Property, PropertyType, TransactionType, PropertyStatus, PropertyImage

Base.metadata.create_all(bind=engine)

db = SessionLocal()

SAMPLE_IMAGES = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
]

SAMPLE_PROPERTIES = [
    dict(title="Appartement lumineux avec vue mer", property_type=PropertyType.APARTMENT,
         transaction_type=TransactionType.SALE, price=1850000, surface_area=95, rooms=4,
         bedrooms=2, bathrooms=2, city="Casablanca", address="Boulevard de la Corniche, Ain Diab",
         description="Bel appartement retape avec vue degagee sur l'ocean, proche des plages et des commerces.",
         is_featured=True),
    dict(title="Villa contemporaine avec piscine", property_type=PropertyType.VILLA,
         transaction_type=TransactionType.SALE, price=6200000, surface_area=320, rooms=8,
         bedrooms=5, bathrooms=4, city="Bouskoura", address="Golf City, Bouskoura",
         description="Villa d'architecte au coeur d'un quartier residentiel securise, jardin paysager et piscine chauffee.",
         is_featured=True),
    dict(title="Studio moderne proche universite", property_type=PropertyType.APARTMENT,
         transaction_type=TransactionType.RENT, price=4500, surface_area=32, rooms=1,
         bedrooms=1, bathrooms=1, city="Rabat", address="Agdal, Rabat",
         description="Studio meuble ideal etudiant ou jeune actif, a deux pas des transports et commerces."),
    dict(title="Maison familiale avec jardin", property_type=PropertyType.HOUSE,
         transaction_type=TransactionType.SALE, price=2450000, surface_area=180, rooms=6,
         bedrooms=4, bathrooms=3, city="Marrakech", address="Targa, Marrakech",
         description="Maison de plain-pied avec grand jardin arbore, quartier calme et familial."),
    dict(title="Bureau equipe en centre d'affaires", property_type=PropertyType.OFFICE,
         transaction_type=TransactionType.RENT, price=12000, surface_area=140, rooms=5,
         city="Casablanca", address="Casa Nearshore Park, Sidi Maarouf",
         description="Plateau de bureaux climatise, salles de reunion equipees, parking securise."),
    dict(title="Terrain constructible vue montagne", property_type=PropertyType.LAND,
         transaction_type=TransactionType.SALE, price=980000, surface_area=500,
         city="Ifrane", address="Route de l'Universite Al Akhawayn, Ifrane",
         description="Terrain viabilise avec vue sur les montagnes du Moyen Atlas, ideal residence secondaire."),
]


def run():
    admin = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            email=settings.FIRST_ADMIN_EMAIL,
            full_name=settings.FIRST_ADMIN_NAME,
            hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Compte admin cree : {settings.FIRST_ADMIN_EMAIL} / {settings.FIRST_ADMIN_PASSWORD}")
    else:
        print("Compte admin deja existant, etape ignoree.")

    agent = db.query(User).filter(User.email == "agent.demo@immoassist.ma").first()
    if not agent:
        agent = User(
            email="agent.demo@immoassist.ma",
            full_name="Agent Demo ImmoAssist",
            hashed_password=get_password_hash("Agent123!"),
            role=UserRole.AGENT,
            phone="+212600000000",
        )
        db.add(agent)
        db.commit()
        db.refresh(agent)
        print("Compte agent cree : agent.demo@immoassist.ma / Agent123!")

    if db.query(Property).count() == 0:
        for i, data in enumerate(SAMPLE_PROPERTIES):
            prop = Property(**data, owner_id=agent.id, status=PropertyStatus.AVAILABLE)
            db.add(prop)
            db.commit()
            db.refresh(prop)
            img_url = SAMPLE_IMAGES[i % len(SAMPLE_IMAGES)]
            db.add(PropertyImage(property_id=prop.id, url=img_url, is_primary=True))
            db.commit()
        print(f"{len(SAMPLE_PROPERTIES)} biens de demonstration crees.")
    else:
        print("Des biens existent deja, etape ignoree.")

    db.close()
    print("Seed termine.")


if __name__ == "__main__":
    run()
