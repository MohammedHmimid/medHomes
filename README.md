# ImmoAssist

Application web immobilière professionnelle : recherche et gestion de biens,
favoris, demandes de contact / assistance immobilière, notifications et
tableau de bord administrateur.

**Stack** : React (Vite + Tailwind CSS) · FastAPI · SQLAlchemy · SQLite (dev) /
PostgreSQL (prod) · JWT · Alembic

---

## 1. Arborescence du projet

```
immoassist/
├── backend/
│   ├── app/
│   │   ├── main.py                 # Point d'entree FastAPI
│   │   ├── core/
│   │   │   ├── config.py           # Configuration (.env)
│   │   │   └── security.py         # Hash mots de passe + JWT
│   │   ├── db/
│   │   │   ├── database.py         # Engine SQLAlchemy, session
│   │   │   └── base.py             # Import de tous les modeles (Alembic)
│   │   ├── models/                 # Modeles SQLAlchemy
│   │   │   ├── user.py
│   │   │   ├── property.py         # Property + PropertyImage
│   │   │   ├── favorite.py
│   │   │   ├── contact.py          # ContactRequest (assistance)
│   │   │   └── notification.py
│   │   ├── schemas/                # Schemas Pydantic (validation/serialisation)
│   │   ├── api/
│   │   │   ├── deps.py             # Dependances (auth JWT, roles)
│   │   │   ├── router.py           # Agregateur de routes /api/v1
│   │   │   └── routes/
│   │   │       ├── auth.py         # /auth/register /auth/login /auth/me
│   │   │       ├── users.py        # /users/me
│   │   │       ├── properties.py   # CRUD biens + upload images
│   │   │       ├── favorites.py
│   │   │       ├── contacts.py     # Contacts & assistance
│   │   │       ├── notifications.py
│   │   │       └── stats.py        # Statistiques admin
│   │   └── utils/file_upload.py
│   ├── alembic/                    # Migrations de base de donnees
│   ├── tests/                      # Tests automatises (pytest)
│   ├── uploads/                    # Images uploadees (cree au demarrage)
│   ├── seed.py                     # Jeu de donnees de demonstration
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/                    # Appels HTTP (axios) vers le backend
    │   ├── context/AuthContext.jsx # Etat d'authentification global
    │   ├── components/             # Navbar, PropertyCard, Filtres, etc.
    │   ├── pages/                  # Home, Properties, Dashboard, Admin...
    │   ├── utils/format.js
    │   ├── App.jsx                 # Routage
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 2. Prérequis

- Python 3.11+ (testé avec 3.12)
- Node.js 18+ et npm
- (Optionnel, pour la production) PostgreSQL 14+

---

## 3. Backend — installation et lancement

```bash
cd backend

# 1. Environnement virtuel
python3 -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate

# 2. Dépendances
pip install -r requirements.txt

# 3. Configuration
cp .env.example .env
# .env est déjà prêt pour SQLite en local (aucune modification requise).
# En production, changez au minimum SECRET_KEY et DATABASE_URL.

# 4. Lancer le serveur (SQLite : les tables sont créées automatiquement)
uvicorn app.main:app --reload --port 8000
```

L'API est disponible sur **http://localhost:8000**, la documentation interactive
(Swagger) sur **http://localhost:8000/api/v1/docs**.

### Peupler la base avec des données de démonstration

```bash
python seed.py
```

Crée :
- un compte **administrateur** : `admin@immoassist.ma` / `Admin123!`
- un compte **agent** : `agent.demo@immoassist.ma` / `Agent123!`
- 6 biens de démonstration (appartement, villa, studio, maison, bureau, terrain)

### Utiliser PostgreSQL au lieu de SQLite

Dans `backend/.env` :

```
DATABASE_URL=postgresql+psycopg2://immoassist_user:motdepasse@localhost:5432/immoassist
```

Puis créez la base et les tables via Alembic (recommandé en production) :

```bash
createdb immoassist   # ou via psql : CREATE DATABASE immoassist;
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

---

## 4. Frontend — installation et lancement

```bash
cd frontend

# 1. Dépendances
npm install

# 2. Configuration
cp .env.example .env
# Par défaut, pointe vers http://localhost:8000 (backend local)

# 3. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur **http://localhost:5173**.

### Build de production

```bash
npm run build      # génère frontend/dist
npm run preview    # prévisualiser le build localement
```

---

## 5. Tester l'application

### Tests automatisés du backend (pytest)

```bash
cd backend
pip install -r requirements-dev.txt
pytest -v
```

Les tests utilisent une base SQLite isolée (`test_immoassist.db`, créée et
supprimée automatiquement) et couvrent : inscription/connexion, création et
filtrage de biens, contrôle des droits (propriétaire/admin), favoris, envoi
d'une demande de contact avec notification au propriétaire, et restriction des
statistiques aux administrateurs.

### Test manuel de bout en bout

1. Démarrer le backend (`uvicorn app.main:app --reload --port 8000`) et le
   frontend (`npm run dev`).
2. Ouvrir http://localhost:5173, créer un compte ou se connecter avec
   `admin@immoassist.ma` / `Admin123!` (après `python seed.py`).
3. Aller sur **Publier un bien**, créer une annonce, y ajouter des photos.
4. Depuis un autre compte, ouvrir le bien, l'ajouter en favori et envoyer une
   demande de contact : une notification apparaît chez le propriétaire.
5. Se connecter en administrateur pour consulter **/admin** (statistiques,
   graphiques par type de bien et par ville).

### Vérifier l'API seule (sans frontend)

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/properties
```

Ou utiliser Swagger UI : http://localhost:8000/api/v1/docs

---

## 6. Notes d'architecture

- **Auth** : JWT (Bearer token), mots de passe hashés avec bcrypt.
- **Rôles** : `user`, `agent`, `admin` — les routes `/stats/*` sont réservées
  aux administrateurs ; la modification/suppression d'un bien est réservée à
  son propriétaire ou à un administrateur.
- **Images** : uploadées sur disque (`backend/uploads/`) et servies en fichiers
  statiques sous `/uploads/...` ; à remplacer par un stockage objet
  (S3, Cloudinary…) en production.
- **CORS** : origines autorisées configurables via `BACKEND_CORS_ORIGINS`
  dans `.env`.
- **Migrations** : la création automatique des tables au démarrage
  (`Base.metadata.create_all`) simplifie le développement local ; en
  production, gérez le schéma via Alembic (`alembic upgrade head`) uniquement.

---

## 7. Prochaines améliorations possibles

- Rafraîchissement de token (refresh tokens) et déconnexion multi-appareils
- Recherche géographique (carte interactive, rayon autour d'un point)
- Messagerie interne entre utilisateurs et agents
- Export CSV/PDF des statistiques administrateur
- Tests end-to-end frontend (Playwright/Cypress) et CI/CD
