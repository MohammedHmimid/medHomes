from fastapi import APIRouter

from app.api.routes import auth, users, properties, favorites, contacts, notifications, stats

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(properties.router)
api_router.include_router(favorites.router)
api_router.include_router(contacts.router)
api_router.include_router(notifications.router)
api_router.include_router(stats.router)
