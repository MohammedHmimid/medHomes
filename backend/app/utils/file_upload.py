import os
import uuid

from fastapi import HTTPException, UploadFile

from app.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


async def save_upload_file(file: UploadFile, property_id: int) -> str:
    """Sauvegarde une image uploadee sur le disque et renvoie son URL publique."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Format d'image non supporte (jpg, jpeg, png, webp)")

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail=f"Image trop lourde (max {settings.MAX_UPLOAD_SIZE_MB} Mo)")

    folder = os.path.join(settings.UPLOAD_DIR, "properties", str(property_id))
    os.makedirs(folder, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(folder, filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    return f"/{settings.UPLOAD_DIR}/properties/{property_id}/{filename}"
