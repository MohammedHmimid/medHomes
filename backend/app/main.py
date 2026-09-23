from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.router import api_router


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API REST pour ImmoAssist - gestion et assistance immobiliere.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    f"/{settings.UPLOAD_DIR}",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="uploads",
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Sante"])
def root():
    return {
        "message": "Bienvenue sur l'API ImmoAssist",
        "docs": f"{settings.API_V1_PREFIX}/docs",
    }


@app.get("/health", tags=["Sante"])
def health_check():
    return {"status": "ok"}