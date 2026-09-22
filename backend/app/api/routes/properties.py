import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.property import Property, PropertyImage, PropertyType, TransactionType, PropertyStatus
from app.models.user import User, UserRole
from app.schemas.property import (
    PropertyCreate, PropertyUpdate, PropertyRead, PropertyReadWithOwner,
    PropertyListResponse, PropertyImageRead
)
from app.api.deps import get_current_active_user, get_current_user_optional
from app.utils.file_upload import save_upload_file

router = APIRouter(prefix="/properties", tags=["Biens immobiliers"])


def _check_owner_or_admin(property_obj: Property, user: User):
    if property_obj.owner_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Vous n'etes pas autorise a modifier ce bien")


@router.get("", response_model=PropertyListResponse)
def list_properties(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Recherche dans le titre, la ville, la description"),
    property_type: Optional[PropertyType] = None,
    transaction_type: Optional[TransactionType] = None,
    status_filter: Optional[PropertyStatus] = Query(None, alias="status"),
    city: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    min_surface: Optional[float] = Query(None, ge=0),
    max_surface: Optional[float] = Query(None, ge=0),
    bedrooms: Optional[int] = Query(None, ge=0),
    is_featured: Optional[bool] = None,
    owner_id: Optional[int] = None,
    sort: str = Query("recent", pattern="^(recent|price_asc|price_desc|surface_asc|surface_desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
):
    query = db.query(Property)

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(Property.title.ilike(like), Property.city.ilike(like), Property.description.ilike(like))
        )
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if transaction_type:
        query = query.filter(Property.transaction_type == transaction_type)
    if status_filter:
        query = query.filter(Property.status == status_filter)
    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
    if min_surface is not None:
        query = query.filter(Property.surface_area >= min_surface)
    if max_surface is not None:
        query = query.filter(Property.surface_area <= max_surface)
    if bedrooms is not None:
        query = query.filter(Property.bedrooms >= bedrooms)
    if is_featured is not None:
        query = query.filter(Property.is_featured == is_featured)
    if owner_id is not None:
        query = query.filter(Property.owner_id == owner_id)

    if sort == "price_asc":
        query = query.order_by(Property.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Property.price.desc())
    elif sort == "surface_asc":
        query = query.order_by(Property.surface_area.asc())
    elif sort == "surface_desc":
        query = query.order_by(Property.surface_area.desc())
    else:
        query = query.order_by(Property.created_at.desc())

    total = query.count()
    pages = max(1, math.ceil(total / limit))
    items = query.offset((page - 1) * limit).limit(limit).all()

    return PropertyListResponse(total=total, page=page, limit=limit, pages=pages, items=items)


@router.get("/mine", response_model=list[PropertyRead])
def list_my_properties(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    return (
        db.query(Property)
        .filter(Property.owner_id == current_user.id)
        .order_by(Property.created_at.desc())
        .all()
    )


@router.get("/{property_id}", response_model=PropertyReadWithOwner)
def get_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Bien introuvable")
    prop.views_count += 1
    db.commit()
    db.refresh(prop)
    return prop


@router.post("", response_model=PropertyRead, status_code=201)
def create_property(
    payload: PropertyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    prop = Property(**payload.model_dump(), owner_id=current_user.id)
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@router.put("/{property_id}", response_model=PropertyRead)
def update_property(
    property_id: int,
    payload: PropertyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Bien introuvable")
    _check_owner_or_admin(prop, current_user)

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(prop, field, value)
    db.commit()
    db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=204)
def delete_property(
    property_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Bien introuvable")
    _check_owner_or_admin(prop, current_user)
    db.delete(prop)
    db.commit()
    return None


@router.post("/{property_id}/images", response_model=PropertyImageRead, status_code=201)
async def upload_property_image(
    property_id: int,
    file: UploadFile = File(...),
    is_primary: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Bien introuvable")
    _check_owner_or_admin(prop, current_user)

    url = await save_upload_file(file, property_id)

    if is_primary:
        for img in prop.images:
            img.is_primary = False

    image = PropertyImage(property_id=property_id, url=url, is_primary=is_primary or not prop.images)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.delete("/{property_id}/images/{image_id}", status_code=204)
def delete_property_image(
    property_id: int,
    image_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Bien introuvable")
    _check_owner_or_admin(prop, current_user)

    image = db.query(PropertyImage).filter(
        PropertyImage.id == image_id, PropertyImage.property_id == property_id
    ).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image introuvable")
    db.delete(image)
    db.commit()
    return None
