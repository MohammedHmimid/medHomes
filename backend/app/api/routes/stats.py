from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.db.database import get_db
from app.models.property import Property, PropertyStatus
from app.models.user import User
from app.models.contact import ContactRequest, RequestStatus
from app.api.deps import get_current_admin_user

router = APIRouter(prefix="/stats", tags=["Statistiques (admin)"])


@router.get("/overview")
def get_overview(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin_user)):
    total_properties = db.query(func.count(Property.id)).scalar()
    total_users = db.query(func.count(User.id)).scalar()
    total_contacts = db.query(func.count(ContactRequest.id)).scalar()
    total_available = db.query(func.count(Property.id)).filter(
        Property.status == PropertyStatus.AVAILABLE
    ).scalar()
    new_contacts = db.query(func.count(ContactRequest.id)).filter(
        ContactRequest.status == RequestStatus.NEW
    ).scalar()
    total_views = db.query(func.coalesce(func.sum(Property.views_count), 0)).scalar()

    return {
        "total_properties": total_properties,
        "total_available_properties": total_available,
        "total_users": total_users,
        "total_contact_requests": total_contacts,
        "new_contact_requests": new_contacts,
        "total_views": total_views,
    }


@router.get("/properties-by-type")
def properties_by_type(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin_user)):
    rows = (
        db.query(Property.property_type, func.count(Property.id))
        .group_by(Property.property_type)
        .all()
    )
    return [{"type": t.value, "count": c} for t, c in rows]


@router.get("/properties-by-city")
def properties_by_city(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin_user)):
    rows = (
        db.query(Property.city, func.count(Property.id))
        .group_by(Property.city)
        .order_by(func.count(Property.id).desc())
        .limit(10)
        .all()
    )
    return [{"city": city, "count": c} for city, c in rows]


@router.get("/properties-by-status")
def properties_by_status(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin_user)):
    rows = (
        db.query(Property.status, func.count(Property.id))
        .group_by(Property.status)
        .all()
    )
    return [{"status": s.value, "count": c} for s, c in rows]


@router.get("/recent-contacts")
def recent_contacts(db: Session = Depends(get_db), _admin: User = Depends(get_current_admin_user)):
    rows = (
        db.query(ContactRequest)
        .order_by(ContactRequest.created_at.desc())
        .limit(8)
        .all()
    )
    return [
        {
            "id": r.id,
            "name": r.name,
            "message": r.message,
            "status": r.status.value,
            "created_at": r.created_at,
        }
        for r in rows
    ]
