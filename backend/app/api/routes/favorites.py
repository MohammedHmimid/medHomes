from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.favorite import Favorite
from app.models.property import Property
from app.models.user import User
from app.schemas.favorite import FavoriteRead
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/favorites", tags=["Favoris"])


@router.get("", response_model=list[FavoriteRead])
def list_my_favorites(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    return (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )


@router.post("/{property_id}", response_model=FavoriteRead, status_code=201)
def add_favorite(
    property_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Bien introuvable")

    existing = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id, Favorite.property_id == property_id)
        .first()
    )
    if existing:
        return existing

    fav = Favorite(user_id=current_user.id, property_id=property_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav


@router.delete("/{property_id}", status_code=204)
def remove_favorite(
    property_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id, Favorite.property_id == property_id)
        .first()
    )
    if not fav:
        raise HTTPException(status_code=404, detail="Ce bien n'est pas dans vos favoris")
    db.delete(fav)
    db.commit()
    return None
